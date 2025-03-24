from typing import List
import time

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from selenium import webdriver

from utils import parse_form
from google_forms import RadioItem, SelectItem, OptionItem
from selenium.webdriver.chrome.options import Options


chrome_options = Options()
chrome_options.add_argument("--headless")  # Без графического интерфейса
chrome_options.add_argument("--disable-gpu")  # Отключение GPU (рекомендуется для headless)
chrome_options.add_argument("--no-sandbox")  # Опционально: для обхода ограничений

app = FastAPI()


# Pydantic модели
class QuestionOption(BaseModel):
    id: str | int
    text: str
    chance: float


class QuestionSchema(BaseModel):
    id: str | int
    type: str  # 'radio', 'checkbox', 'select'
    question: str
    options: List[QuestionOption]


class TestRequest(BaseModel):
    form_url: str
    title: str
    description: str
    questions: List[QuestionSchema]


class Parser(BaseModel):
    url: str


class ProdRequest(TestRequest):
    N: int


@app.post("/api/test")
def test_submit(request: TestRequest):
    driver = webdriver.Chrome()
    try:
        driver.get(request.form_url)
        time.sleep(2)

        form_list = []
        for question in request.questions:
            ans_list = [opt.text for opt in question.options]
            chance_list = [opt.chance for opt in question.options]
            if question.type == 'radio':
                item = RadioItem(ans_list, chance_list, 1, driver)
            elif question.type == 'select':
                item = SelectItem(ans_list, chance_list, 1, driver)
            elif question.type == 'checkbox':
                item = OptionItem(ans_list, chance_list, 1, driver)
            else:
                continue
            form_list.append(item)

        print("list:", form_list)

        driver.execute_script("""
            window.form = document.querySelector('form');
            window.elems = form.children[1].children[0].children[1].children;
            window.elem = null;
        """)
        for index, item in enumerate(form_list):
            print(f"pick {item}")
            item.pick(index)
            
        time.sleep(15)
        
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500
    finally:
        driver.quit()


@app.post("/api/prod")
def prod_submit(request: ProdRequest):
    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get(request.form_url)
        time.sleep(5)

        form_list = []
        for question in request.questions:
            ans_list = [opt.text for opt in question.options]
            chance_list = [opt.chance for opt in question.options]
            if question.type == 'radio':
                item = RadioItem(ans_list, chance_list, request.N, driver)
            elif question.type == 'select':
                item = SelectItem(ans_list, chance_list, request.N, driver)
            elif question.type == 'checkbox':
                item = OptionItem(ans_list, chance_list, request.N, driver)
            else:
                continue
            form_list.append(item)
        
        for i in range(request.N):
            print(f"{i}/{request.N}", end="\r")
            driver.execute_script("""
                window.form = document.querySelector('form');
                window.elems = form.children[1].children[0].children[1].children;
                window.elem = null;
            """)
            for index, item in enumerate(form_list):
                item.pick(index)
            
            driver.execute_script("document.body.querySelector('[aria-label=Submit]').click();")
            time.sleep(0.1)
            
            if i != request.N - 1:
                driver.execute_script("let a = document.body.querySelector('a'); if (a.textContent == 'Отправить ещё один ответ') a.click();")
            
            time.sleep(0.5)

        return {"status": "success", "submitted": request.N}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500
    finally:
        driver.quit()


@app.post('/api/parser')
def parser(request: Parser):
    try:
        json = parse_form(request.url)
        return {"status": "success", "parsed": json}
    except Exception as e:
        return {"status": "error", "message": str(e)}


app.mount("/", StaticFiles(directory="../web-gui/dist", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
