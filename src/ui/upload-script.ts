export const UPLOAD_SCRIPT = `
document.querySelectorAll("form[data-webp-upload]").forEach(function (form) {
  form.addEventListener("submit", async function (event) {
    var input = form.querySelector('input[type="file"]');
    if (!input || !input.files || !input.files[0]) return;
    var file = input.files[0];
    if (file.type === "image/webp" && file.size <= 512000) return;
    event.preventDefault();
    var bitmap = await createImageBitmap(file);
    var maxSide = 1600;
    var scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    var canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    var blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, "image/webp", 0.82);
    });
    var transfer = new DataTransfer();
    transfer.items.add(new File([blob], "foto.webp", { type: "image/webp" }));
    input.files = transfer.files;
    form.submit();
  });
});
`;
