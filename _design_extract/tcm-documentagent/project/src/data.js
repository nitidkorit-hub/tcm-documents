// Sample data: realistic Thai construction projects with documents
window.TCM_DATA = (() => {
  const now = new Date();
  const daysAgo = (d) => {
    const dt = new Date(now); dt.setDate(dt.getDate() - d);
    return dt.toISOString().slice(0,10);
  };

  const projects = [
    {
      id: 'p1',
      name: 'รถไฟฟ้าสายสีม่วงใต้ ช่วงเตาปูน–ราษฎร์บูรณะ',
      code: 'MRT-PP',
      client: 'การรถไฟฟ้าขนส่งมวลชนแห่งประเทศไทย',
      color: '#1F3A5F',
      status: 'กำลังดำเนินการ',
    },
    {
      id: 'p2',
      name: 'อาคารสำนักงานใหญ่ ABC ทาวเวอร์',
      code: 'ABC-HQ',
      client: 'บริษัท เอบีซี โฮลดิ้ง จำกัด (มหาชน)',
      color: '#3A6EA5',
      status: 'กำลังดำเนินการ',
    },
    {
      id: 'p3',
      name: 'ทางหลวงพิเศษหมายเลข 7 ส่วนต่อขยาย',
      code: 'M7-EXT',
      client: 'กรมทางหลวง',
      color: '#2DBE60',
      status: 'อนุมัติแบบ',
    },
    {
      id: 'p4',
      name: 'อ่างเก็บน้ำห้วยโสมง อันเนื่องมาจากพระราชดำริ',
      code: 'HSM-RES',
      client: 'กรมชลประทาน',
      color: '#6E56CF',
      status: 'ปิดโครงการ',
    },
  ];

  // doc types - matches the 8 categories from base skill
  const T = {
    EIA: 'EIA',
    DRAW: 'แบบ',
    CONT: 'สัญญา',
    LABOR: 'แรงงาน',
    STD: 'มาตรฐาน',
    MOM: 'MOM',
    BOQ: 'ราคา',
    OTHER: 'อื่นๆ',
  };

  const ext = { pdf: 'pdf', doc: 'docx', xls: 'xlsx', img: 'jpg' };

  // build files. Versions: same baseName, different rev/date.
  const mk = (id, proj, type, baseName, rev, dateOffset, ext, sizeKB) => ({
    id, projectId: proj, type, baseName,
    name: rev ? `${baseName}_${rev}.${ext}` : `${baseName}.${ext}`,
    rev, date: daysAgo(dateOffset),
    ext, size: sizeKB, uploader: 'ทีมเอกสาร',
  });

  const files = [
    // p1 - MRT
    mk('f01','p1', T.EIA, 'EIA_MRT-PP-เตาปูน', 'Rev3', 2, 'pdf', 8420),
    mk('f02','p1', T.EIA, 'EIA_MRT-PP-เตาปูน', 'Rev2', 35, 'pdf', 8120),
    mk('f03','p1', T.EIA, 'EIA_MRT-PP-เตาปูน', 'Rev1', 92, 'pdf', 7980),
    mk('f04','p1', T.DRAW, 'แบบโครงสร้าง_สถานี-ดาวคะนอง', 'Rev2', 5, 'pdf', 24580),
    mk('f05','p1', T.DRAW, 'แบบโครงสร้าง_สถานี-ดาวคะนอง', 'Rev1', 28, 'pdf', 23110),
    mk('f06','p1', T.BOQ, 'BOQ_MRT-PP_เซ็คชั่น-A', 'v3', 1, 'xlsx', 1240),
    mk('f07','p1', T.BOQ, 'BOQ_MRT-PP_เซ็คชั่น-A', 'v2', 18, 'xlsx', 1180),
    mk('f08','p1', T.MOM, 'MOM_ประชุมสัปดาห์ที่-18', null, 3, 'pdf', 420),
    mk('f09','p1', T.MOM, 'MOM_ประชุมสัปดาห์ที่-17', null, 10, 'pdf', 410),
    mk('f10','p1', T.CONT, 'สัญญาก่อสร้างหลัก_MRT-PP', 'Rev2', 60, 'pdf', 5320),
    mk('f11','p1', T.LABOR, 'รายงานความปลอดภัยแรงงาน_Q1-2026', null, 22, 'pdf', 980),

    // p2 - ABC Tower
    mk('f20','p2', T.DRAW, 'แบบสถาปัตย์_ABC-Tower-Lobby', 'Rev4', 1, 'pdf', 18200),
    mk('f21','p2', T.DRAW, 'แบบสถาปัตย์_ABC-Tower-Lobby', 'Rev3', 14, 'pdf', 17800),
    mk('f22','p2', T.DRAW, 'แบบสถาปัตย์_ABC-Tower-Lobby', 'Rev2', 40, 'pdf', 17200),
    mk('f23','p2', T.BOQ, 'BOQ_ABC-Tower-โครงสร้าง', 'v2', 4, 'xlsx', 2160),
    mk('f24','p2', T.STD, 'มยผ-1101-เสาคอนกรีต', null, 30, 'pdf', 1820),
    mk('f25','p2', T.MOM, 'MOM_ประชุมเจ้าของโครงการ', null, 6, 'pdf', 380),
    mk('f26','p2', T.EIA, 'EIA_ABC-Tower-สิ่งแวดล้อม', 'Rev1', 55, 'pdf', 6210),

    // p3 - M7
    mk('f30','p3', T.DRAW, 'แบบทางหลวง_M7-Section-3', 'Rev2', 7, 'pdf', 32400),
    mk('f31','p3', T.DRAW, 'แบบทางหลวง_M7-Section-3', 'Rev1', 48, 'pdf', 30200),
    mk('f32','p3', T.EIA, 'EIA_M7-ส่วนต่อขยาย', 'Rev2', 12, 'pdf', 9800),
    mk('f33','p3', T.BOQ, 'BOQ_M7-งานดิน', 'v1', 21, 'xlsx', 980),
    mk('f34','p3', T.STD, 'มาตรฐานทล-Spec-2020', null, 75, 'pdf', 3200),
    mk('f35','p3', T.MOM, 'MOM_ประชุมตรวจรับงานงวด-3', null, 9, 'pdf', 460),

    // p4 - dam
    mk('f40','p4', T.DRAW, 'แบบเขื่อนหลัก_ห้วยโสมง', 'Rev5', 90, 'pdf', 28600),
    mk('f41','p4', T.CONT, 'สัญญาก่อสร้างเขื่อน_ห้วยโสมง', 'Rev1', 180, 'pdf', 4800),
    mk('f42','p4', T.BOQ, 'BOQ_ห้วยโสมง-งานเขื่อน', 'v3', 95, 'xlsx', 1640),
    mk('f43','p4', T.MOM, 'MOM_ประชุมส่งมอบ', null, 88, 'pdf', 320),
  ];

  // mark latest version per (project, type, baseName)
  const groups = {};
  files.forEach(f => {
    const k = `${f.projectId}|${f.type}|${f.baseName}`;
    if (!groups[k]) groups[k] = [];
    groups[k].push(f);
  });
  Object.values(groups).forEach(g => {
    g.sort((a,b) => new Date(b.date) - new Date(a.date));
    g.forEach((f, i) => { f.isLatest = i === 0; });
  });

  return { projects, files, types: T };
})();
