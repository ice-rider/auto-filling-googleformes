import random
import time


class Item:
    def __init__(self, ans_list: list[str], chance_list: list[float], n: int, driver):
        self.ans = ans_list
        self.chance_list = chance_list
        self.n = n
        self.driver = driver
        self.answers = []
        self.generate_answers()
        random.shuffle(self.answers)
        self.answer_iter = iter(self.answers)

    def generate_answers(self):
        raise NotImplementedError("Subclasses must implement this method")

    def pick(self, index):
        self.driver.execute_script(f"window.elem = window.elems[{index}];")
        self.set()

    def set(self):
        pass

    def get_ans(self):
        return next(self.answer_iter)


class RadioItem(Item):
    def generate_answers(self):
        n = self.n
        chances = self.chance_list
        num_answers = len(chances)
        ideals = [c * n for c in chances]
        counts = [int(ideal) for ideal in ideals]
        remainder = n - sum(counts)

        if remainder > 0:
            fractions = [(ideals[i] - counts[i], i) for i in range(num_answers)]
            fractions.sort(reverse=True, key=lambda x: x[0])
            for i in range(remainder):
                idx = fractions[i][1]
                counts[idx] += 1

        answers = []
        for idx in range(num_answers):
            answers.extend([idx] * counts[idx])
        self.answers = answers

    def set(self):
        number = self.get_ans()
        self.driver.execute_script(f"""
            window.elem.querySelectorAll('label')[{number}].click();
        """)


class SelectItem(Item):
    def generate_answers(self):
        n = self.n
        chances = self.chance_list
        num_answers = len(chances)
        ideals = [c * n for c in chances]
        counts = [int(ideal) for ideal in ideals]
        remainder = n - sum(counts)

        if remainder > 0:
            fractions = [(ideals[i] - counts[i], i) for i in range(num_answers)]
            fractions.sort(reverse=True, key=lambda x: x[0])
            for i in range(remainder):
                idx = fractions[i][1]
                counts[idx] += 1

        answers = []
        for idx in range(num_answers):
            answers.extend([idx] * counts[idx])
        self.answers = answers

    def set(self):
        number = self.get_ans()
        self.driver.execute_script("window.elem.querySelectorAll('[role=option]')[0].click();")
        time.sleep(0.5)
        self.driver.execute_script(f"window.elem.querySelectorAll('[role=option]')[{number + 1}].click();")


class OptionItem(Item):
    def generate_answers(self):
        n = self.n
        chances = self.chance_list

        answers = []
        for j in range(n):
            current = []
            for i in range(len(chances)):
                if random.random() <= chances[i]:
                    current.append(i)
            answers.append(current)

        for index, elem in enumerate(answers):
            if elem == list():
                for i in range(index+1, len(answers)):
                    if len(answers[i]) >= 2:
                        answers[index].append(answers[i].pop())
                        break

        self.answers = answers

    def set(self):
        numbers = self.get_ans()
        if numbers == []:
            numbers = [0]
        for number in numbers:
            self.driver.execute_script(f"""
                console.log("click", window.elem.querySelectorAll('[role=checkbox]')[{number}]);
                window.elem.querySelectorAll('[role=checkbox]')[{number}].click();
            """)