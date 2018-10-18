const { createCanvas, loadImage } = require('canvas')
const path = require('path')
const fs = require('fs')
const compress = require('compressjs')
const algorithm = compress.PPM

try {
  fs.statSync(path.join(__dirname, 'image.png'))
} catch (e) {
  console.log('Please provide an image (ROOT_DIR/image.png)')
  process.exit(1)
}

loadImage('image.png').then(image => {
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0)

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

  let last = -1
  let count = 0
  const simplified = []

  for (let i = 0; i < imgData.length; i += 4) {
    let val
    if (imgData[i] > 0) {
      val = 0
    } else {
      val = 1
    }

    if (last === val) {
      count++
    } else {
      if (last >= 0) {
        if (count > 1) {
          simplified.push(last + ',' + count)
        } else {
          simplified.push(last)
        }
      }

      last = val
      count = 1
    }
  }

  if (count > 1) {
    simplified.push(last + ',' + count)
  } else {
    simplified.push(last)
  }

  const str = simplified.join(',')

  const data = Buffer.from(str, 'utf8')

  const compressed = algorithm.compressFile(data)

  fs.writeFileSync(path.join(__dirname, 'output.floorplan'), compressed)
})
