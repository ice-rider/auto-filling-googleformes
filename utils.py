from uuid import uuid4
import time
import datetime

from selenium import webdriver


def parse_form(url):
    driver = webdriver.Chrome()
    driver.get(url)
    time.sleep(2)
    try:
        return driver.execute_script(f"""
            form = document.querySelector('form');
            elems = form.children[1].children[0].children[1].children;
            
            parsed = []

            for (let elem of elems) {{
                parsed_elem = {{
                    "id": "{uuid4()}"
                }}

                parsed_elem.question = elem.querySelector('[role=heading]').textContent;
                parsed_elem.options = [];
                var selector;

                if (elem.querySelector('[role=radiogroup]')) {{
                    parsed_elem.type = "radio";
                    selector = "label";
                }} else if (elem.querySelector('[role=list]')) {{
                    parsed_elem.type = "option";
                    selector = "[role=listitem]";
                }} else if (elem.querySelector('[role=listbox]')) {{
                    parsed_elem.type = "select";
                    selector = "[role=option]";
                }}

                for (let option of elem.querySelectorAll(selector))
                    parsed_elem.options.push({{
                        "id": "{uuid4()}",
                        "text": option.textContent,
                        "chance": 0.0
                    }});

                parsed.push(parsed_elem);
            }}

            const json = {{
                "title": "Form",
                "description": "form parsed from url: {url}, at {datetime.now().isoformat()}",
                "questions": parsed
            }}

            return JSON.stringify(json);
        """)
    except Exception as e:
        raise ValueError("parsing error: "+str(e)) from e
    finally:
        driver.quit()
