import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Hashmap containing program names and their path segment/slug, update as needed
programs = {"Aerospace Engineering": "aerospace",
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
    # Keeping your original, correct URL logic
    calendar_link = f"https://www.torontomu.ca/calendar/{calendar_year}-{calendar_year + 1}/programs/feas/"
    
    # Pre-compile the regex pattern for case-insensitive matching
    program_pattern = re.compile(r"Full-time.*program.*", re.IGNORECASE)


    for program in programs_list:
        # Generate the slug (e.g., "aerospace" or "mechatronics")
        url_slug = programs_list[program]
        response = requests.get(f"{calendar_link}{url_slug}", timeout=(5,10))
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        
        # 1. Target all accordion panels on the page
        all_panels = soup.find_all("div", class_=["panel", "panel-default"])

        
                    
        for panel in all_panels:
            # 2. Grab and check the heading text of the accordion
            heading_zone = panel.find("div", class_="panel-heading")
            if not heading_zone:
                continue
                
            heading_text = heading_zone.get_text(strip=True)
            
            # CONDITION CHECK: Match only the specific program tracking accordions
            if not program_pattern.search(heading_text):
                continue
            
            # 3. Target the inner body content of this specific valid panel
            panel_body = panel.find("div", class_="panel-body")
            if not panel_body:
                continue

            # for script_tag in panel_body.find_all("script"):
            #     script_tag.decompose()
            
            # 4. Turn the contents into a clean, beautifully indented HTML layout string
            inner_soup = BeautifulSoup(panel_body.decode_contents(), "html.parser")
            legible_html = inner_soup.prettify()
            
            # 5. Save directly as a standard, pristine HTML file
            program_name = program.split(" ")[0]
            file_name = f"Programs_v2/{program_name}/{program_name}-{calendar_year}_layout.html"

            try:
                soup = BeautifulSoup(legible_html, 'html.parser')
                
                for a_tag in soup.find_all('a', class_='qTipCourse'):
                    course_code = a_tag.get_text(strip=True)  
                    
                    # Skip if the course is enclosed within a small tag since those are notes and not actual courses
                    if (a_tag.find_parent('small')):
                        continue
            
                    # Create checkbox
                    checkbox = soup.new_tag('input', type='checkbox', value=course_code)
                    checkbox['class'] = 'course-checkbox'
                    
                    # Wrap a tag and checkbox in a label
                    label = soup.new_tag('label')
                    a_tag.replace_with(label)
                    label.append(checkbox)
                    label.append(a_tag)


                for ul in soup.find_all('ul'):
                    ul['style'] = 'list-style: none; padding-left: 0; margin: 0;'

                #updating urls for hyperlinks
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
                print(e.message if hasattr(e, 'message') else e)
            print(f"Successfully created file: {file_name} (from section '{heading_text}')")

save_program_layouts(programs, 2026)