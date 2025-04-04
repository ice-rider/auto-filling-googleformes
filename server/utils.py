from datetime import datetime
from uuid import uuid4
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


chrome_options = Options()
chrome_options.add_argument("--headless")  # Без графического интерфейса
chrome_options.add_argument("--disable-gpu")  # Отключение GPU (рекомендуется для headless)
chrome_options.add_argument("--no-sandbox")  # Опционально: для обхода ограничений


def parse_form(url):
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(2)
    try:
        driver.execute_script("""
            function generateUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            window.uuid4 = generateUUID;
        """)
        return driver.execute_script(f"""
            form = document.querySelector('form');
            elems = form.children[1].children[0].children[1].children;
            
            parsed = []

            for (let elem of elems) {{
                parsed_elem = {{
                    "id": window.uuid4(),
                }}

                parsed_elem.question = elem.querySelector('[role=heading]').textContent;
                parsed_elem.options = [];
                var selector;

                if (elem.querySelector('[role=radiogroup]')) {{
                    parsed_elem.type = "radio";
                    selector = "label";
                }} else if (elem.querySelector('[role=list]')) {{
                    parsed_elem.type = "checkbox";
                    selector = "[role=listitem]";
                }} else if (elem.querySelector('[role=listbox]')) {{
                    parsed_elem.type = "select";
                    selector = "[role=option]";
                }}

                for (let option of elem.querySelectorAll(selector))
                    parsed_elem.options.push({{
                        "id": window.uuid4(),
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
