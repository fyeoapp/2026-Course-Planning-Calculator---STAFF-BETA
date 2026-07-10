import json
import re
import requests
from bs4 import BeautifulSoup

response = requests.get("https://www.torontomu.ca/engineering-architectural-science/programs/undergraduate-programs/transition-program/")
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

# Configuration
summer_filename = "summer_26-27.json"
summer_heading = r"Summer 2026 - Engineering.*Architectural Science Transition"

spring_filename = "spring_26-27.json"
spring_heading = r"Spring 2026 - Engineering.*Architectural Science Transition.*"


def parse_requisites(requisites_block):
    result = {
        "prereqs": [],
        "coreqs": [],
        "antireqs": [],
        "custom_reqs": []
    }
    
    if not requisites_block:
        return result
    
    key_map = {
        "Prerequisites": "prereqs",
        "Co-Requisites": "coreqs",
        "Antirequisites": "antireqs",
        "Custom Requisites": "custom_reqs"
    }

    def parse_req_text(p_tag):
        if not p_tag:
            return []
        
        text = p_tag.get_text(separator=' ', strip=True)
        if text.lower() == 'none' or not text:
            return []
        
        result = []
        
        # Remove parentheses to keep string extraction linear and flat
        text = text.replace('(', '').replace(')', '')
        
        # Split logical requirements apart by "and" or commas
        and_parts = re.split(r'\band\b|,', text, flags=re.IGNORECASE)
        
        for part in and_parts:
            part = part.strip()
            if not part:
                continue
                
            # Check if this sub-segment contains an alternative "or" condition
            if re.search(r'\bor\b', part, flags=re.IGNORECASE):
                or_choices = re.split(r'\bor\b', part, flags=re.IGNORECASE)
                # Compress spaces entirely to match JS format: ["CHE411", "ECN801"]
                cleaned_choices = [c.strip().replace(' ', '') for c in or_choices if c.strip()]
                if cleaned_choices:
                    result.append(cleaned_choices)
            else:
                # Regular course prerequisite assignment
                course = part.replace(' ', '')
                if course:
                    result.append(course)
        
        return result

    for div in requisites_block.find_all(class_="requisites"):
        heading = div.find("h3")
        if not heading:
            continue
        
        heading_text = heading.get_text(strip=True)
        key = key_map.get(heading_text)
        if not key:
            continue
        
        p = div.find("p")
        result[key] = parse_req_text(p)
    
    return result


def extract_courses(heading, filename):
    extracted_data = []

    # Find the heading text
    header_text = soup.find(string=re.compile(heading, re.IGNORECASE))

    if not header_text:
        print(f"Could not find a section matching: {heading}")
        return

    # Find the parent <a> tag containing the heading
    header_link = header_text.find_parent("a")

    if not header_link:
        print(f"Found heading but could not locate associated link.")
        return

    href = header_link.get("href")

    if not href:
        print("Header link does not contain an href attribute.")
        return

    # Remove leading # from href
    target_id_selector = href.replace("#", "")

    # Find the corresponding accordion/container
    target_container = soup.find(id=target_id_selector)

    if not target_container:
        print("Found heading, but could not resolve the associated schedule container.")
        return

    # Extract courses
    course_links = target_container.find_all("a", class_="qTipCourse")
    
    for idx, course in enumerate(course_links, start=1):
        url = f'https://www.torontomu.ca{course.get("href", "").replace(".html", "/")}'
        
        try:
            resp = requests.get(url, timeout=(5, 10))
            resp.raise_for_status()
        except Exception as e:
            print(f"Error fetching course details at: {url} | {e}")
            continue
    
        soup_req = BeautifulSoup(resp.text, "html.parser")
        requisites = soup_req.find(class_="requisitesBlock")
        reqs = parse_requisites(requisites)

        extracted_data.append({
            "id": idx,
            "anchor_text": course.get_text(strip=True),
            "url": url,
            "raw_html_snippet": str(course),
            "prereqs": reqs["prereqs"],
            "coreqs": reqs["coreqs"],
            "antireqs": reqs["antireqs"],
            "custom_reqs": reqs["custom_reqs"]
        })
        
    print(f"Successfully extracted {len(extracted_data)} courses.")

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=4)
        
    print(f"Saved data to {filename}")


# Run extraction passes
extract_courses(summer_heading, summer_filename)
extract_courses(spring_heading, spring_filename)
