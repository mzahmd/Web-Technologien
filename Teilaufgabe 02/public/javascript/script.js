const form = document.getElementById("form-header");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = document.getElementById("todoInput");

    if (!input.value) {
        alert("Bitte ausfüllen");
        return;
    }

    const response = await fetch("/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ todo: input.value }),
    });
    const result = await response.json();

    const div = document.createElement("div");
    const inputTask = document.createElement("input");

    inputTask.value = result.todo.name;
    inputTask.setAttribute("readonly", true)
    inputTask.setAttribute("data-created", result.todo.createdAt)
    div.classList.add("task-main")

    const updateBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");

    updateBtn.classList.add("updateButton");
    updateBtn.innerText = "Update";

    updateBtn.addEventListener('click', async () => {
        if (updateBtn.innerText.toLowerCase() === "update") {
            inputTask.removeAttribute("readonly");
            updateBtn.innerText = "Save";
        } else {
            inputTask.setAttribute("readonly", true);
            updateBtn.innerText = "Update";
            console.log(inputTask);
            await fetch("/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ newTodo: inputTask.value, dataId: inputTask.getAttribute("data-created") })
            })
        }
    });

    deleteBtn.addEventListener('click', async () => {
        const response = await fetch("/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ dataId: inputTask.getAttribute("data-created") })
        })

        const result = await response.json();
        if (result.delete === "SUCCESS") {
            tasks.removeChild(div);
        }
    });

    deleteBtn.classList.add("deleteButton");
    deleteBtn.innerText = "Delete";

    div.appendChild(inputTask);
    div.appendChild(updateBtn);
    div.appendChild(deleteBtn);


    const tasks = document.querySelector(".tasks-main");
    tasks.appendChild(div);
    input.value = "";
});