function formatTanggal(tgl) {
    let [d, m, y] = tgl.split("-");
    return new Date(`${y}-${m}-${d}`);
}

function tampilkanPesan() {
    let data = JSON.parse(localStorage.getItem("pesan")) || [];
    let container = document.getElementById("listContainer");

    container.innerHTML = "";

    let today = new Date();

    data.forEach((item, index) => {
        let tanggalBuka = formatTanggal(item.tanggal);
        let terkunci = today < tanggalBuka;

        container.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card p-3 ${terkunci ? 'locked' : ''}" onclick="cekPesan(${index}, ${terkunci})">
                    <h5>${item.nama}</h5>
                    <small>${item.tanggal}</small>
                    <p class="mt-2 text-muted">
                        ${terkunci ? '🔒 Terkunci' : 'Klik untuk buka'}
                    </p>
                </div>
            </div>
        `;
    });
}

function cekPesan(index, terkunci) {
    if (terkunci) {
        alert("Maaf, message ini masih terkunci");
        return;
    }

    let data = JSON.parse(localStorage.getItem("pesan"));

    document.getElementById("modalNama").innerText = data[index].nama;
    document.getElementById("modalIsi").innerText = data[index].pesan;
    document.getElementById("modalTanggal").innerText = "Dibuka pada: " + data[index].tanggal;

    let modal = new bootstrap.Modal(document.getElementById("modalPesan"));
    modal.show();
}

tampilkanPesan();