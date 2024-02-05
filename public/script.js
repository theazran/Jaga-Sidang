/**=============================================
Please you don't remove!

Github    : https://github.com/theazran
Instagram : https://instagram.com/theazran_
Facebook  : https://facebook.com/theazran
Threads   : https://threads.net/theazran_
Saweria   : https://saweria.co/theazran
Blog      : https://azran.my.id

Bulukumba, Sulawesi Selatan, ID
================================================*/

function showTodos() {
  fetch('/todos')
    .then(response => response.json())
    .then(data => {
      const completedTodos = data.filter(todo => todo.completed);
      const notifSpan = document.getElementById('notif');

      let notifHTML = '';

      completedTodos.forEach(todo => {
        let icon = '';
        if (todo.nomorPerkara.includes('Pid')) {
          icon = 'bg-danger bg-opacity-25';
        } else if (todo.nomorPerkara.includes('Pdt')) {
          icon = 'bg-success bg-opacity-25';
        }
        // notifHTML += `<><i class="${icon}"></i> <br>${todo.terdakwa}</span><hr>`;
        notifHTML += `<div class="card mb-2 shadow-sm">
                        <div class="card-body">
                          <h6 class="card-title">${todo.nomorPerkara}</h6>
                           <p class="card-text">${todo.terdakwa}</p>
                        </div>
                      </div>`;
      });

      notifHTML += '';

      notifSpan.innerHTML = notifHTML;


      const todoList = document.getElementById('todo-list');
      todoList.innerHTML = '';
      let completedCount = 0;
      let incompleteCount = 0;

      const completedCardGroup = document.createElement('div');
      completedCardGroup.classList.add('card', 'col-md-12', 'border-0');

      const incompleteCardGroup = document.createElement('div');
      incompleteCardGroup.classList.add('card', 'col-md-12', 'border-0');

      data.forEach(todo => {
        const card = document.createElement('div');
        card.classList.add('card');
        //card.classList.add('mt-1');
        card.classList.add('mb-3', 'border-0');
        card.classList.add('shadow-sm');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header', 'border-0');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
          toggleStatus(todo.id);
          setInterval(() => {
            location.reload();
          }, 1000);
        });

        const label = document.createElement('label');
        label.textContent = todo.nomorPerkara;
        label.classList.add('m-1');


        if (todo.completed) {
          label.classList.add('text-decoration-line-through');
          card.classList.add('komplit');
          completedCount++;
          completedCardGroup.appendChild(card);
        } else {
          card.classList.add('belum');
          incompleteCount++;
          incompleteCardGroup.appendChild(card);
        }

        cardHeader.appendChild(checkbox);
        cardHeader.appendChild(label);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const cardTitle = document.createElement('h6');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = todo.agenda;

        const cardText = document.createElement('p');
        cardText.classList.add('card-text', 'mb-0');
        cardText.textContent = todo.terdakwa;

        const span = document.createElement('span');
        span.textContent = 'Success';
        span.classList.add('badge', 'bg-danger');
        span.textContent = todo.jenisPerkara;

        const ruangSidang = document.createElement('p');
        ruangSidang.classList.add('card-text');
        ruangSidang.textContent = todo.ruangSidang;

        const keterangan = document.createElement('textarea');
        keterangan.classList.add('form-control');
        keterangan.value = todo.keterangan;
        keterangan.addEventListener('change', () => updateKeterangan(todo.id, keterangan.value));

        const cardFooter = document.createElement('div');
        cardFooter.classList.add('card-footer', 'border-0');

        const tanggalSidang = document.createElement('i');
        tanggalSidang.textContent = todo.hariTanggalSidang;
        cardFooter.appendChild(tanggalSidang);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(span);
        cardBody.appendChild(ruangSidang);
        cardBody.appendChild(keterangan);

        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        card.appendChild(cardFooter);
      });

      const completedCountElement = document.getElementById('completed-count');
      completedCountElement.textContent = completedCount + " of " + data.length;


      todoList.appendChild(incompleteCardGroup);
      todoList.appendChild(completedCardGroup);
    });
}

// Fungsi untuk mengubah status todo
function toggleStatus(id) {
  fetch(`/todos/${id}`, {
    method: 'PUT'
  })
    .then(response => response.json())
    .then(todo => {
      const todoDiv = document.querySelector(`.todo-list input[type="checkbox"][value="${id}"]`).parentNode;
      const keteranganInput = todoDiv.querySelector('.form-control input[type="text"]');
      keteranganInput.value = todo.keterangan;

      const todoList = document.getElementById('todo-list');
      const completedTodos = todoList.querySelectorAll('.card.completed');

      if (todo.completed) {
        todoDiv.classList.add('completed');
        if (completedTodos.length > 0) {
          todoList.insertBefore(todoDiv, completedTodos[0]);
        } else {
          todoList.appendChild(todoDiv);
        }
      } else {
        todoDiv.classList.remove('completed');
        todoList.insertBefore(todoDiv, todoList.firstChild);
      }
    });
}

function updateKeterangan(id, keterangan) {
  fetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `keterangan=${keterangan}`
  });
}

document.getElementById('todo-form').addEventListener('submit', e => {
  e.preventDefault();
  addTodo();
});

fetch("/piket-sidang")
  .then(response => response.json())
  .then(data => {
    const piketData = data.piket;
    let piketHTML = "";
    for (let nama in piketData) {
      piketHTML += `<b>${nama}</b> - <span class=" badge border border-warning text-warning">${piketData[nama]}</span><br>`;
    }

    document.getElementById("piketsidang").innerHTML = piketHTML;
  })
  .catch(error => console.log(error));
showTodos();

function updateJam() {
  var jamElement = document.getElementById("jam");
  var sekarang = new Date();
  var jam = sekarang.getHours();
  var menit = sekarang.getMinutes();
  var detik = sekarang.getSeconds();
  jamElement.textContent = jam + ":" + menit + ":" + detik;
}
setInterval(updateJam, 1000);