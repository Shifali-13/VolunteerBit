const router = require('express').Router();
const PDFDocument = require('pdfkit');
const Application = require('../models/Application');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/:applicationId', protect, restrictTo('volunteer'), async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.applicationId)
      .populate({ path: 'task', populate: { path: 'ngo', select: 'orgName' } })
      .populate('volunteer', 'name');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (String(app.volunteer._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your certificate' });
    }
    if (app.status !== 'completed') {
      return res.status(400).json({ message: 'Certificate available only after task completion' });
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${app._id}.pdf`);
    doc.pipe(res);

    const W = doc.page.width;
    doc.rect(25, 25, W - 50, doc.page.height - 50).lineWidth(4).stroke('#4f46e5');
    doc.rect(35, 35, W - 70, doc.page.height - 70).lineWidth(1).stroke('#a5b4fc');

    doc.fillColor('#4f46e5').fontSize(38).font('Helvetica-Bold')
      .text('CERTIFICATE OF APPRECIATION', 0, 100, { align: 'center' });
    doc.fillColor('#555').fontSize(16).font('Helvetica')
      .text('This certificate is proudly presented to', 0, 170, { align: 'center' });
    doc.fillColor('#111').fontSize(34).font('Helvetica-Bold')
      .text(app.volunteer.name, 0, 205, { align: 'center' });

    const mins = app.task.durationMins;
    doc.fillColor('#555').fontSize(16).font('Helvetica')
      .text(
        `for volunteering ${mins} minutes on "${app.task.title}"\nwith ${app.task.ngo.orgName}`,
        0, 265, { align: 'center', lineGap: 6 }
      );
    doc.fontSize(13).text(
      `Date: ${new Date(app.completedAt).toDateString()}`,
      0, 370, { align: 'center' }
    );
    doc.fillColor('#4f46e5').fontSize(14).font('Helvetica-Bold')
      .text('VolunteerBit', 0, 430, { align: 'center' });
    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;
