import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from pathlib import Path

# Mapping of program names to their corresponding URL slugs on TMU website
programs = {
   "Aerospace Engineering": "aerospace",
   "Biomedical Engineering": "biomedical_eng",
   "Chemical Engineering": "chemical",
   "Civil Engineering": "civil",
   "Computer Engineering": "computer_eng",
   "Electrical Engineering": "electrical",
   "Industrial Engineering": "industrial",
   "Mechanical Engineering": "mechanical",
   "Mechatronics Engineering": "mechatronics-engineering"
}

def save_program_layouts_flat(programs_list, calendar_year):
   """Generates files for each program's curriculum layout for a given academic year.
   Programs list is a hashmap of program names to their corresponding URL slugs on TMU website (e.g., "Computer Engineering": "computer_eng").
   Calendar year is expected to be the starting year of the academic session (e.g., 2026 for 2026-2027).
   """
   calendar_link = f"https://www.torontomu.ca/calendar/{calendar_year}-{calendar_year + 1}/programs/feas/"

    # Regex pattern to identify semester ranges (e.g., 1st & 2nd Semester)
   semester_range_pattern = re.compile(
       r"((1st\s*&\s*2nd)|(3rd\s*&\s*4th)|(5th\s*&\s*6th)|(7th\s*&\s*8th))\s*Semester",
       re.IGNORECASE
   )
#    Regex pattern to further filter down into single semester panels (e.g., 1st Semester, 2nd Semester)
   semester_pattern = re.compile(
       r"(1st|2nd|3rd|4th|5th|6th|7th|8th)\s+Semester",
       re.IGNORECASE
   )

   for program in programs_list:
       
       url_slug = programs_list[program]
       try:
           response = requests.get(f"{calendar_link}{url_slug}", timeout=(5, 10))
           response.raise_for_status()
       except Exception as e:
           print(f"Error fetching data for program '{program}' at URL: {calendar_link}{url_slug}")
           print(e)
           continue
       

       soup = BeautifulSoup(response.text, "html.parser")
       all_panels = soup.find_all("div", class_=["panel", "panel-default"])
       
       final_parts = []
       
       panel_counter = 0
       common_panel_index = None

    #  Creating a regex pattern to match the program name   
       program_keywords = f"{program.split(' ')[0]}.*{program.split(' ')[-1]}"
       program_pattern = re.compile(program_keywords, re.IGNORECASE)

    #  Creating a regex pattern to match the common panels (e.g., "Common First Year Courses")
       common_pattern = re.compile("common.*first", re.IGNORECASE)

       # Process and append panels directly as they are encountered
       for panel in all_panels:
        #    Remove images from panel since they're not locally saved
           for img in panel.select('p img[src]'): img.decompose()


           heading_zone = panel.find("div", class_="panel-heading")
           panel_body = panel.find("div", class_="panel-body")

           if not heading_zone or not panel_body:
               continue

           body_text = panel_body.get_text(" ", strip=True)

           # Validate if it is a structured curriculum semester panel
           is_valid_course_panel = (
               semester_range_pattern.search(body_text)
               and len(semester_pattern.findall(body_text)) >= 2
            #    qTipCourse class existence indicates a course link is present
               and panel_body.find("a", class_="qTipCourse")
           )

           if not is_valid_course_panel:
               continue

           heading_text = heading_zone.get_text(strip=True)

           
           # Identify and save the index of the primary/common curriculum panel.
           # This runs only once ('common_panel_index is None') when it finds the first heading 
           # matching either a general common panel layout or the specific engineering program name.
           if common_panel_index is None and (common_pattern.search(heading_text) or program_pattern.search(heading_text)):
               common_panel_index = panel_counter

           # Build checkboxes out on the links
           for a_tag in panel_body.find_all('a', class_='qTipCourse'):
               
            #    Filter out any qTipCourses which are either Workterms (WKT) or are used as notes (e.g., something like * CEN 199 is graded in a pass/fail basis, usually enclosed in small tags on the website) since we do not want to put a checkbox next to these
               if a_tag.find_parent('small') or re.compile(".*WKT.*", re.IGNORECASE).search(a_tag.text):
                   continue

               course_code = a_tag.get_text(strip=True)

               checkbox = soup.new_tag('input', type='checkbox', value=course_code)
               checkbox['class'] = 'course-checkbox'
               checkbox['data-panel-owner'] = str(panel_counter)

               label = soup.new_tag('label')
               label.append(checkbox)

               new_a = soup.new_tag('a', href=a_tag.get('href'))
               new_a['class'] = a_tag.get('class', [])
               new_a.string = course_code

               label.append(new_a)
               a_tag.replace_with(label)

           # Apply basic styling to lists
           for ul in panel_body.find_all('ul'):
               ul['style'] = 'list-style: none; padding-left: 0; margin: 0;'

           # Fix relative hyper-links
           BASE_URL = "http://torontomu.ca"
           for tag in panel_body.find_all(href=True):
               href = tag.get("href")
               if not href or href.startswith(("#", "mailto:", "http://", "https://")):
                   continue
               tag["href"] = urljoin(BASE_URL, href)

           # Wrapped back up with clean tracking attribute targets
           panel_html = f"""
           <div class="panel panel-default" data-panel-container-id="{panel_counter}">
               <div class="panel-heading"><h4>{heading_text}</h4></div>
               <div class="panel-body">
                   {panel_body.decode_contents()}
               </div>
           </div>
           """
           final_parts.append(panel_html)
           panel_counter += 1

       # Cross-Panel Clearing State Engine
       protected_idx = common_panel_index if common_panel_index is not None else 0
       
       script_tag = f"""
       <script>
       document.addEventListener("DOMContentLoaded", () => {{
           const protectedIndex = {protected_idx};

           // Tracks change inputs across the layout
           document.addEventListener("change", (e) => {{
               if (!e.target.classList.contains('course-checkbox') || !e.target.checked) return;

               const currentPanel = parseInt(e.target.dataset.panelOwner);

               // Clear alternate options if changing tracking selections
               if (currentPanel !== protectedIndex) {{
                   document.querySelectorAll(".course-checkbox").forEach(cb => {{
                       const targetPanel = parseInt(cb.dataset.panelOwner);
                       if (targetPanel !== protectedIndex && targetPanel !== currentPanel) {{
                           cb.checked = false;
                       }}
                   }});
                   
                   // Sync button text headers across hidden/unselected options
                   if(window.parent && window.parent.document) {{
                      window.parent.document.querySelectorAll('button[data-semester]').forEach(btn => {{
                          const semAttr = btn.getAttribute('data-semester');
                          if(semAttr && !semAttr.startsWith('panel-' + currentPanel + '-')) {{
                              btn.textContent = 'Select All';
                          }}
                      }});
                   }}
               }}
           }});
       }});
       </script>
       """
       final_parts.append(script_tag)

       # Combine everything together sequentially
       combined_html = "".join(final_parts)
       inner_soup = BeautifulSoup(combined_html, "html.parser")
       legible_html = inner_soup.prettify()

       program_name = program.split(" ")[0]
       os.makedirs(f"Programs_v2/{program_name}", exist_ok=True)
       file_name = f"Programs_v2/{program_name}/{program_name}-{calendar_year}_layout.html"

       with open(file_name, "w", encoding="utf-8") as html_file:
        html_file.write(f'<!--This file was generated using {Path(__file__).name} -->\n')
        html_file.write('<!DOCTYPE html>\n')
        html_file.write('<meta charset="UTF-8">\n')
        html_file.write('<base target="_blank">\n')
        html_file.write('<div class="scoped bootstrap" style="padding: 20px;">\n')
        html_file.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">\n')
        html_file.write(legible_html)
        html_file.write('</div>')

       print(f"Successfully created file: {file_name} (from program '{program}')")

for year in range(2026, 2015, -1):
    save_program_layouts_flat(programs, year)