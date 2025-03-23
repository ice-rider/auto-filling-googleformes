from typing import List
import time

from fastapi import FastAPI
from pydantic import BaseModel
from selenium import webdriver

from utils import parse_form
from google_forms import RadioItem, SelectItem, OptionItem


app = FastAPI()


# Pydantic модели
class QuestionOption(BaseModel):
    id: int
    text: str
    chance: float


class QuestionSchema(BaseModel):
    id: int
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
                item = RadioItem(ans_list, chance_list, driver)
            elif question.type == 'select':
                item = SelectItem(ans_list, chance_list, driver)
            elif question.type == 'checkbox':
                item = OptionItem(ans_list, chance_list, driver)
            else:
                continue
            form_list.append(item)
        
        driver.execute_script("""
            window.form = document.querySelector('form');
            window.elems = form.children[1].children[0].children[1].children;
            window.elem = null;
        """)
        
        for index, item in enumerate(form_list):
            item.pick(index)
        
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        driver.quit()


@app.post("/api/prod")
def prod_submit(request: ProdRequest):
    driver = webdriver.Chrome()
    try:
        driver.get(request.form_url)
        time.sleep(2)

        form_list = []
        for question in request.questions:
            ans_list = [opt.text for opt in question.options]
            chance_list = [opt.chance for opt in question.options]
            if question.type == 'radio':
                item = RadioItem(ans_list, chance_list, driver)
            elif question.type == 'select':
                item = SelectItem(ans_list, chance_list, driver)
            elif question.type == 'checkbox':
                item = OptionItem(ans_list, chance_list, driver)
            else:
                continue
            form_list.append(item)
        
        for i in range(request.N):
            driver.execute_script("""
                window.form = document.querySelector('form');
                window.elems = form.children[1].children[0].children[1].children;
                window.elem = null;
            """)
            for index, item in enumerate(form_list):
                item.pick(index)
            
            driver.execute_script("document.body.querySelector('[aria-label=Submit]').click();")
            time.sleep(0.3)
            
            if i != request.N - 1:
                driver.execute_script("document.body.querySelector('a').click()")
                time.sleep(0.3)

        return {"status": "success", "submitted": request.N}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        driver.quit()


@app.post('/api/parser')
def parser(request: Parser):
    try:
        json = parse_form(request.url)
        return {"status": "success", "parsed": json}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
