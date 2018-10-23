const { createCanvas, loadImage } = require('canvas')
const path = require('path')
const fs = require('fs')
const compress = require('compressjs')
const algorithm = compress.BWTC

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

  let filtered = []
  let last = null

  for (let i = 0; i < imgData.length; i += 4) {
    let val
    if (imgData[i] < 200) {
      val = i / 4

      if (last) {
        filtered.push(val - last)
      } else {
        filtered.push(val)
      }

      last = val
    }
  }

  console.log(filtered.length + ' entries')

  let simplified = []
  last = -1
  let count = 1

  for (let i = 0; i < filtered.length; i++) {
    const val = filtered[i]
    if (val === last) {
      count++
    } else if (last >= 0 && count > 1) {
      simplified.push(last + ':' + count)
      count = 1
    } else if (last >= 0) {
      simplified.push(last)
    }

    last = val
  }

  console.log('simplified length: ' + simplified.length)

  const str0 = filtered.join(',')

  const str = filtered.join(',')

  console.log(str.length, str0.length)

  const data = Buffer.from(str, 'utf8')

  const compressed = algorithm.compressFile(data)

  fs.writeFileSync(path.join(__dirname, 'output.floorplan'), compressed)
})
