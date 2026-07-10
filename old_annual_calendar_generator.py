import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from pathlib import Path
from collections import OrderedDict

# Yearly calendar base-url
year_url_hashmap = {
    "2010": "https://www.torontomu.ca/calendar/2010-2011/pg949.html",
    "2011": "https://www.torontomu.ca/calendar/2011-2012/pg949.html",
    "2012": r"https://www.torontomu.ca/calendar/2012-2013/FACULTY%20OF%20ENGINEERING%20AND%20ARCHITECTURAL%20SCIENCE.html",
    "2013": r"https://www.torontomu.ca/calendar/2013-2014/FACULTY%20OF%20ENGINEERING%20AND%20ARCHITECTURAL%20SCIENCE.html",
    "2014": "https://www.torontomu.ca/calendar/2014-2015/pg949.html",
    "2015": "https://www.torontomu.ca/calendar/2015-2016/pg949.html",
}

programs = [
    r"Aerospace\s+Engineering",
    r"Biomedical\s+Engineering",
    r"Chemical\s+Engineering",
    r"Civil\s+Engineering",
    r"Computer\s+Engineering",
    r"Electrical\s+Engineering",
    r"Industrial\s+Engineering",
    r"Mechanical\s+Engineering",
]

SEMESTER_RANGE_PATTERN = re.compile(
    r"((1st\s*&\s*2nd)|(3rd\s*&\s*4th)|(5th\s*&\s*6th)|(7th\s*&\s*8th))\s*Semester",
    re.IGNORECASE,
)
SEMESTER_KEY_PATTERN = re.compile(r"(1st|3rd|5th|7th)", re.IGNORECASE)
COURSE_CODE_PATTERN = re.compile(r"^[A-Z]{2,4}\s+\d{3}[A-Z]?(/[A-Z])?$", re.IGNORECASE)
WKT_PATTERN = re.compile(r"WKT", re.IGNORECASE)
SEMESTER_ORDER = ["1st", "3rd", "5th", "7th"]
BASE_URL = "http://torontomu.ca"


def semester_key(text):
    match = SEMESTER_KEY_PATTERN.search(text or "")
    return match.group(1).lower() if match else None


def is_common_link(link_text):
    return bool(re.search(r"\bcommon\s+to\b", link_text, re.IGNORECASE))


def is_course_link(a_tag):
    if a_tag.find_parent("small"):
        return False
    if not a_tag.find_parent("td"):
        return False
    text = a_tag.get_text(strip=True)
    if not text or WKT_PATTERN.search(text):
        return False
    return bool(COURSE_CODE_PATTERN.match(text))


def is_base_program_link(link_text, program_first_word):
    pattern = re.compile(
        rf"^Bachelor\s+of\s+Engineering\s*\({program_first_word}\s+Engineering\)\s*$",
        re.IGNORECASE,
    )
    return bool(pattern.match(link_text.strip()))


def is_option_link(link_text):
    return bool(re.search(r"\boption\b", link_text, re.IGNORECASE))


def is_cohort_link(link_text):
    return bool(re.search(r"Fall\s+20\d{2}\s+1st\s+Yr\s+Admits", link_text, re.IGNORECASE))


def fetch_page(url):
    response = requests.get(url, timeout=(5, 10))
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def extract_page_content_blocks(soup):
    page_content = soup.find("table", id=re.compile(r"pageContent", re.IGNORECASE))
    if not page_content:
        page_content = soup.find("table", id=re.compile(r"_ctl0__ctl0_pageContent"))
    if not page_content:
        return []

    blocks = []
    for container in page_content.find_all("div", class_="item-container"):
        title = container.find("span", class_="generic-title")
        body = container.find("span", class_="generic-body")
        if body:
            blocks.append((title.get_text(strip=True) if title else "", body))

    if blocks:
        return blocks

    for body in page_content.find_all("span", class_="generic-body"):
        title = body.find_previous_sibling("span", class_="generic-title")
        title_text = title.get_text(strip=True) if title else ""
        blocks.append((title_text, body))

    return blocks


INDIVIDUAL_SEMESTER_PATTERN = re.compile(
    r"(1st|2nd|3rd|4th|5th|6th|7th|8th)\s+SEMESTER",
    re.IGNORECASE,
)


def semester_key_from_body(body):
    match = INDIVIDUAL_SEMESTER_PATTERN.search(body.get_text("\n", strip=True))
    return match.group(1).lower() if match else None


def extract_sections_from_soup(soup, range_hint=None):
    sections = OrderedDict()
    range_key = semester_key(range_hint)
    blocks = extract_page_content_blocks(soup)

    if blocks:
        if range_key:
            sections[range_key] = "".join(body.decode_contents() for _, body in blocks)
            return sections

        for title_text, body in blocks:
            key = semester_key(title_text) or semester_key_from_body(body)
            if not key:
                continue
            html = body.decode_contents()
            sections[key] = sections.get(key, "") + html

        if sections:
            return sections

    whole_body = soup.find("span", class_="generic-body")
    if whole_body:
        page_title = soup.find("span", class_="page-title")
        hint = range_hint or (page_title.get_text(strip=True) if page_title else soup.get_text(" ", strip=True))
        fallback_key = semester_key(hint) or semester_key_from_body(whole_body) or "7th"
        sections[fallback_key] = whole_body.decode_contents()

    return sections


def fetch_semester_sections(program_page_soup, calendar_base_url):
    sections = OrderedDict()
    seen_urls = set()

    inline_sections = extract_sections_from_soup(program_page_soup)
    for key, html in inline_sections.items():
        sections[key] = html

    for sem_link in program_page_soup.find_all("a", string=SEMESTER_RANGE_PATTERN):
        sem_url = urljoin(calendar_base_url, sem_link.get("href"))
        if sem_url in seen_urls:
            continue
        seen_urls.add(sem_url)

        range_hint = sem_link.get_text(strip=True)

        try:
            sem_soup = fetch_page(sem_url)
        except Exception as e:
            print(f"Error fetching semester page: {sem_url}")
            print(e)
            continue

        fetched_sections = extract_sections_from_soup(sem_soup, range_hint=range_hint)
        link_key = semester_key(range_hint)
        if link_key and link_key not in sections and fetched_sections:
            sections[link_key] = "".join(fetched_sections.values())
            continue

        for key, html in fetched_sections.items():
            if key not in sections:
                sections[key] = html

    return sections


def merge_semester_sections(*section_sources):
    """Fill missing semester ranges from fallback sources, in order."""
    merged = OrderedDict()
    for key in SEMESTER_ORDER:
        for source in section_sources:
            if key in source:
                merged[key] = source[key]
                break
    return merged


def common_applies_to_variant(common_heading, variant):
    scope_match = re.search(r"common\s+to\s+(.+)$", common_heading, re.IGNORECASE)
    if not scope_match:
        return False

    scope = scope_match.group(1).lower()
    variant_heading = variant["heading"].lower()

    if "all options" in scope:
        return not variant["is_common"]

    if "regular program" in scope and (
        variant["is_base"] or "regular program" in variant_heading
    ):
        return True

    if variant["is_option"]:
        option_match = re.search(r"-\s*([^-]+?\soption)\s*$", variant_heading, re.IGNORECASE)
        if option_match:
            option_label = option_match.group(1).lower()
            option_keyword = option_label.replace(" option", "").strip()
            if option_keyword and option_keyword in scope:
                return True

    return False


def build_merged_sections(variant, base_variant, common_variants):
    if variant["is_common"]:
        return variant["sections"]

    applicable_common = OrderedDict()
    for common in common_variants:
        if common_applies_to_variant(common["heading"], variant):
            for key in SEMESTER_ORDER:
                if key in common["sections"] and key not in applicable_common:
                    applicable_common[key] = common["sections"][key]

    base_sections = base_variant["sections"] if base_variant else OrderedDict()
    return merge_semester_sections(variant["sections"], applicable_common, base_sections)


def add_checkboxes(soup):
    for a_tag in soup.find_all("a"):
        if not is_course_link(a_tag):
            continue

        course_code = a_tag.get_text(strip=True)
        classes = list(a_tag.get("class") or [])
        if "qTipCourse" not in classes:
            classes.append("qTipCourse")

        checkbox = soup.new_tag("input", type="checkbox", value=course_code)
        checkbox["class"] = "course-checkbox"

        label = soup.new_tag("label")
        label.append(checkbox)

        new_a = soup.new_tag("a", href=a_tag.get("href"))
        new_a["class"] = classes
        new_a.string = course_code

        label.append(new_a)
        a_tag.replace_with(label)


def fix_relative_links(soup):
    for tag in soup.find_all(href=True):
        href = tag.get("href")
        if not href or href.startswith(("#", "mailto:", "http://", "https://")):
            continue
        tag["href"] = urljoin(BASE_URL, href)


def process_section_html(section_html):
    soup = BeautifulSoup(section_html, "html.parser")
    add_checkboxes(soup)
    fix_relative_links(soup)
    return soup.decode_contents()


def build_panel_html(heading_text, sections):
    body_parts = []
    for key in SEMESTER_ORDER:
        if key not in sections:
            continue

        range_label = {
            "1st": "1st & 2nd Semester",
            "3rd": "3rd & 4th Semester",
            "5th": "5th & 6th Semester",
            "7th": "7th & 8th Semester",
        }[key]

        processed = process_section_html(sections[key])
        body_parts.append(
            f'<div class="resTitle section"><h2>{range_label}</h2></div>'
            f'<div class="resText section"><div class="curriculum-block">{processed}</div></div>'
        )

    panel_body = "".join(body_parts)
    return f"""
<div class="panel panel-default" data-panel-container-id="0">
    <div class="panel-heading"><h4>{heading_text}</h4></div>
    <div class="panel-body">
        {panel_body}
    </div>
</div>
"""


def build_file_name(program_regex, calendar_year, link_text):
    program_name = program_regex.split(r"\s")[0] if r"\s" in program_regex else program_regex.split(" ")[0]

    option_match = re.search(r"(?:-\s*|\s+)([^-(]+?Option(?:s)?)$", link_text, re.IGNORECASE)
    common_match = re.search(r"common\s+to\s+(.+)$", link_text, re.IGNORECASE)

    if common_match:
        raw_common = common_match.group(1).strip()
        formatted_common = raw_common.lower().replace(" ", "_")
        formatted_common = re.sub(r"[^a-z0-9_]", "", formatted_common)
        file_name = f"Programs_old/{program_name}/{program_name}-{calendar_year}_common_to_{formatted_common}_layout.html"
    elif option_match:
        raw_option = option_match.group(1).strip()
        formatted_option = raw_option.lower().replace(" ", "_")
        formatted_option = re.sub(r"[^a-z0-9_]", "", formatted_option)
        file_name = f"Programs_old/{program_name}/{program_name}-{calendar_year}_{formatted_option}_layout.html"
    else:
        file_name = f"Programs_old/{program_name}/{program_name}-{calendar_year}_layout.html"

    return file_name, program_name


def write_layout_file(file_name, heading_text, sections):
    combined_html = build_panel_html(heading_text, sections)
    inner_soup = BeautifulSoup(combined_html, "html.parser")
    legible_html = inner_soup.prettify()

    os.makedirs(os.path.dirname(file_name), exist_ok=True)
    with open(file_name, "w", encoding="utf-8") as html_file:
        html_file.write(f"<!--This file was generated using {Path(__file__).name} -->\n")
        html_file.write("<!DOCTYPE html>\n")
        html_file.write('<meta charset="UTF-8">\n')
        html_file.write('<base target="_blank">\n')
        html_file.write('<div class="scoped bootstrap" style="padding: 20px;">\n')
        html_file.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">\n')
        html_file.write(legible_html)
        html_file.write("</div>")


def save_program_layouts_flat(programs_list, calendar_year):
    calendar_link = year_url_hashmap[calendar_year]
    calendar_base_url = f"https://www.torontomu.ca/calendar/{calendar_year}-{int(calendar_year) + 1}/"

    try:
        soup = fetch_page(calendar_link)
    except Exception as e:
        print(f"Error fetching data at URL: {calendar_link}")
        print(e)
        return

    for program in programs_list:
        program_pattern = re.compile(program, re.IGNORECASE)
        program_link = soup.find("a", string=program_pattern)
        if not program_link:
            print(f"Could not find program link for '{program}' in {calendar_year}")
            continue

        program_url = urljoin(calendar_base_url, program_link.get("href"))
        try:
            program_soup = fetch_page(program_url)
        except Exception as e:
            print(f"Error fetching data at URL: {program_url}")
            print(e)
            continue

        bachelor_pattern = re.compile(rf"Bachelor\s+of\s+Engineering\s*\({program.split(r'\s')[0]}", re.IGNORECASE)
        variant_links = program_soup.find_all("a", string=bachelor_pattern)

        variant_data = []
        for program_course in variant_links:
            link_text = program_course.get_text(strip=True)
            if is_cohort_link(link_text):
                continue

            file_name, program_name = build_file_name(program, calendar_year, link_text)

            course_href = urljoin(calendar_base_url, program_course.get("href"))
            try:
                program_course_soup = fetch_page(course_href)
            except Exception as e:
                print(f"Error fetching data at URL: {course_href}")
                print(e)
                continue

            sections = fetch_semester_sections(program_course_soup, calendar_base_url)
            if not sections:
                print(f"No semester sections found for '{link_text}' ({calendar_year})")
                continue

            variant_data.append(
                {
                    "file_name": file_name,
                    "heading": link_text,
                    "sections": sections,
                    "is_base": is_base_program_link(link_text, program_name),
                    "is_option": is_option_link(link_text),
                    "is_common": is_common_link(link_text),
                }
            )

        base_variant = None
        base_candidates = [v for v in variant_data if v["is_base"]]
        if base_candidates:
            base_variant = min(base_candidates, key=lambda v: len(v["heading"]))

        common_variants = [v for v in variant_data if v["is_common"]]

        for variant in variant_data:
            sections = build_merged_sections(variant, base_variant, common_variants)

            write_layout_file(variant["file_name"], variant["heading"], sections)
            print(f"Successfully created file: {variant['file_name']} (from program '{program}')")


# Run script targeting 2013 configurations
if __name__ == "__main__":
    save_program_layouts_flat(programs, "2015")
