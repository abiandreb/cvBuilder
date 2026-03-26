import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const A4_W_MM = 210
const A4_H_MM = 297

export async function exportToPdf(element, filename) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // How tall is the canvas in mm if we fit width to A4?
  const imgWidthMm = A4_W_MM
  const imgHeightMm = (canvas.height * A4_W_MM) / canvas.width

  // How many A4 pages do we need?
  const totalPages = Math.ceil(imgHeightMm / A4_H_MM)

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage()
    // Shift the image up by one page height each iteration
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      -(i * A4_H_MM),
      imgWidthMm,
      imgHeightMm
    )
  }

  pdf.save(filename)
}
