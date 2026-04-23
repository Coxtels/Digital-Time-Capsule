flatpickr("#tanggal", {
    dateFormat: "d-m-Y",
    minDate: "today"
});

function simpanPesan() {
    let nama = document.getElementById("nama").value;
    let pesan = document.getElementById("pesan").value;
    let tanggal = document.getElementById("tanggal").value;

    if (!nama || !pesan || !tanggal) {
        alert("Semua field harus diisi!");
        return;
    }

    let data = JSON.parse(localStorage.getItem("pesan")) || [];

    data.push({ nama, pesan, tanggal });
    localStorage.setItem("pesan", JSON.stringify(data));

    alert("Pesan berhasil disimpan!");

    window.location.href = "index.html";
}