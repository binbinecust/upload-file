function getImageBase64(file) {
  let ext = file.name.replace(/.+\./, "")
  let img = new Image();
  img.src = URL.createObjectURL(file);
  return new Promise((res) => {

    img.onload = () => {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL("image/" + ext);
      canvas = null;
      console.log(dataURL);
      res(dataURL)
    }
  })
}

export {
  getImageBase64
}