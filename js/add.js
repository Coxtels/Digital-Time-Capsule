flatpickr("#tanggal", {
    dateFormat: "d-m-Y",
    minDate: "today"
});

function showModal(type, title, text, redirect = false) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalText").innerText = text;

    let icon = document.getElementById("modalIcon");

    if (type === "success") {
        icon.innerHTML = "✔️";
        icon.className = "icon-success";
    } else {
        icon.innerHTML = "❌";
        icon.className = "icon-error";
    }

    let modal = new bootstrap.Modal(document.getElementById("modalNotif"));
    modal.show();

    if (redirect) {
        document.getElementById("modalNotif").addEventListener('hidden.bs.modal', function () {
            window.location.href = "index.html";
        }, { once: true });
    }
}

function simpanPesan() {
    let nama = document.getElementById("nama").value;
    let pesan = document.getElementById("pesan").value;
    let tanggal = document.getElementById("tanggal").value;

    if (!nama || !pesan || !tanggal) {
        showModal("error", "Input belum lengkap", "Semua field harus diisi!");
        return;
    }

    let data = JSON.parse(localStorage.getItem("pesan")) || [];

    data.push({ nama, pesan, tanggal });
    localStorage.setItem("pesan", JSON.stringify(data));

    showModal("success", "Berhasil", "Pesan berhasil disimpan!", true);
}