import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Hashmap containing program names and their path segment/slug, update as needed
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

def save_program_layouts(programs_list, calendar_year):

   calendar_link = f"https://www.torontomu.ca/calendar/{calendar_year}-{calendar_year + 1}/programs/feas/"

   semester_range_pattern = re.compile(
       r"((1st\s*&\s*2nd)|(3rd\s*&\s*4th)|(5th\s*&\s*6th)|(7th\s*&\s*8th))\s*Semester",
       re.IGNORECASE
   )

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

       valid_panel_html = []

       # -------------------------
       # COLLECT VALID PANELS
       # -------------------------
       for panel in all_panels:

           heading_zone = panel.find("div", class_="panel-heading")
           panel_body = panel.find("div", class_="panel-body")

           if not heading_zone or not panel_body:
               continue

           heading_text = heading_zone.get_text(" ", strip=True)
           body_text = panel_body.get_text(" ", strip=True)

           is_valid = (
               semester_range_pattern.search(body_text)
               and len(semester_pattern.findall(body_text)) >= 2
               and panel_body.find("a", class_="qTipCourse")
           )

           if not is_valid:
               continue

           valid_panel_html.append((heading_text, panel_body.decode_contents()))

       # -------------------------
       # SPLIT PANELS
       # -------------------------
       common_panels = []
       other_panels = []

       for title, html in valid_panel_html:
           if "common first" in title.lower():
               common_panels.append((title, html))
           else:
               other_panels.append((title, html))

       final_parts = []

       # Always include common first
       for _, html in common_panels:
           final_parts.append(html)

       use_toggle = len(other_panels) > 1

       # -------------------------
       # ADD TOGGLE (if needed)
       # -------------------------
       if use_toggle:
           toggle_bar = soup.new_tag("div")
           toggle_bar["id"] = "program-toggle"

           style = soup.new_tag("style")
           style.string = """
#program-toggle { margin-bottom: 12px; }
.toggle-btn {
   margin-right: 6px;
   padding: 6px 14px;
   cursor: pointer;
   border: 1px solid #ccc;
   background: #f5f5f5;
   border-radius: 4px;
   font-size: 13px;
}
.toggle-btn-active {
   background: #28a745;
   color: white;
   border-color: #28a745;
}
"""

           toggle_bar.append(style)

           for i, (title, _) in enumerate(other_panels):
               btn = soup.new_tag("button")
               btn["class"] = "toggle-btn toggle-btn-active" if i == 0 else "toggle-btn"
               btn["data-target"] = str(i)
               btn.string = title
               toggle_bar.append(btn)

           final_parts.insert(0, str(toggle_bar))

       # -------------------------
       # WRAP OTHER PANELS
       # -------------------------
       for i, (title, html) in enumerate(other_panels):
           wrapper = soup.new_tag("div")
           wrapper["data-panel"] = str(i)

           if use_toggle:
               wrapper["style"] = "display: block;" if i == 0 else "display: none;"

           wrapper.append(BeautifulSoup(html, "html.parser"))
           final_parts.append(str(wrapper))

       # TOGGLE SCRIPT
       if use_toggle:
           script = soup.new_tag("script")
           script.string = """
document.querySelectorAll(".toggle-btn").forEach(btn => {
   btn.addEventListener("click", () => {
       const target = btn.dataset.target;

       document.querySelectorAll("[data-panel]").forEach(p => {
           // If this is NOT the panel being selected, find and reset its checkboxes
           if (p.dataset.panel !== target) {
               p.querySelectorAll(".course-checkbox").forEach(cb => {
                   cb.checked = false;
               });
               p.style.display = "none";
           } else {
               p.style.display = "block";
           }
       });

       document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("toggle-btn-active"));
       btn.classList.add("toggle-btn-active");
   });
});
"""
           final_parts.append(str(script))
           final_parts.append(str(script))

       # -------------------------
       # FINAL HTML
       # -------------------------
       combined_html = "".join(final_parts)
       inner_soup = BeautifulSoup(combined_html, "html.parser")
       legible_html = inner_soup.prettify()

       program_name = program.split(" ")[0]
       file_name = f"Programs_v2/{program_name}/{program_name}-{calendar_year}_layout.html"

       try:
           soup = BeautifulSoup(legible_html, "html.parser")

           

           for a_tag in soup.find_all('a', class_='qTipCourse'):

               if a_tag.find_parent('small'):
                   continue

               course_code = a_tag.get_text(strip=True)

               checkbox = soup.new_tag('input', type='checkbox', value=course_code)
               checkbox['class'] = 'course-checkbox'

               label = soup.new_tag('label')
               label.append(checkbox)

               new_a = soup.new_tag('a', href=a_tag.get('href'))
               new_a['class'] = a_tag.get('class', [])
               new_a.string = course_code

               label.append(new_a)

               a_tag.replace_with(label)

           for ul in soup.find_all('ul'):
               ul['style'] = 'list-style: none; padding-left: 0; margin: 0;'

           BASE_URL = "http://torontomu.ca"

           for tag in soup.find_all(href=True):
               href = tag.get("href")

               if not href:
                   continue

               if href.startswith(("#", "mailto:", "http://", "https://")):
                   continue

               tag["href"] = urljoin(BASE_URL, href)

           legible_html = str(soup)

           with open(file_name, "w", encoding="utf-8") as html_file:
               html_file.write('<meta charset="UTF-8">\n')
               html_file.write('<base target="_blank">\n')
               html_file.write('<div class="scoped bootstrap">\n')
               html_file.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">\n')
               html_file.write(legible_html)
               html_file.write('</div>')

       except Exception as e:
           print(e)

       print(f"Successfully created file: {file_name} (from program '{program}')")


# save_program_layouts(programs, 2026)
for year in range(2025, 2016, -1):
    save_program_layouts(programs, year)
