function formatTanggal(tgl) {
    let [d, m, y] = tgl.split("-");
    return new Date(`${y}-${m}-${d}`);
}

function hitungCountdown(tanggal) {
    let [d, m, y] = tanggal.split("-");
    let target = new Date(`${y}-${m}-${d}`);
    let now = new Date();

    let selisih = target - now;

    if (selisih <= 0) return "Sudah bisa dibuka";

    let hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
    let jam = Math.floor((selisih / (1000 * 60 * 60)) % 24);

    return `${hari} hari ${jam} jam lagi`;
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
    let data = JSON.parse(localStorage.getItem("pesan"));
    let item = data[index];

    if (terkunci) {
        document.getElementById("countdown").innerText = hitungCountdown(item.tanggal);
        let modal = new bootstrap.Modal(document.getElementById("modalError"));
        modal.show();
        return;
    }

    document.getElementById("modalNama").innerText = item.nama;
    document.getElementById("modalIsi").innerText = item.pesan;
    document.getElementById("modalTanggal").innerText = "Dibuka pada: " + item.tanggal;

    document.getElementById("isiPesan").style.display = "none";

    let capsule = document.getElementById("capsuleAnim");
    capsule.style.display = "block";
    capsule.classList.remove("unlock-animation");

    let modal = new bootstrap.Modal(document.getElementById("modalPesan"));
    modal.show();

    setTimeout(() => {
        capsule.classList.add("unlock-animation");

        setTimeout(() => {
            capsule.style.display = "none";
            document.getElementById("isiPesan").style.display = "block";
        }, 500);

    }, 1200);
}

tampilkanPesan();