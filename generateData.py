
labs = ["Lab 2: Build Your Own Blocks (Conceptual)",
        "Lab 2: Build Your Own Blocks (Code)",
        "Lab 3: Conditionals, Reporters u0026 Abstraction (Code)",
        "Lab 3: Conditionals, Reporters, u0026 Abstraction (Conceptual)",
        "Lab 4: Lists + Loops (Conceptual)",
        "Lab 4: Lists + Loops (code)",
        "Lab 5: Lists + HOFs (Conceptual)",
        "Lab 5: Lists + HOFs (Code)",
        "Lab 6: Algorithms (Code)"
        ]

import random
import json

scores = []
student_number = 100
student_ids = [f"S{str(i).zfill(3)}" for i in range(1, student_number + 1)]
for lab in labs:
    score = {}
    score = {
        'Assignment': lab,
        'scores': [
        {
            'id': id,
            'score':random.randint(0, 100) / 10
        } for id in student_ids
        ]
    }
    scores.append(score)
    
with open('studentScore.json', mode='w', newline='') as file:
    json.dump(scores, file, indent=4)
    