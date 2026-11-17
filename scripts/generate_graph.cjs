const fs = require('fs');

// Helper to calculate Euclidean distance between two nodes
function calcDist(n1, n2) {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  // Floor scale: roughly 0.065 meters per pixel
  return Math.round(Math.hypot(dx, dy) * 0.065 * 10) / 10 || 1.0;
}

// Helper to determine compass direction from n1 to n2
function getDirection(n1, n2) {
  if (n1.floor !== n2.floor) {
    return n2.floor > n1.floor ? 'up' : 'down';
  }
  const dx = n2.x - n1.x;
  const dy = n2.y - n1.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'E' : 'W';
  } else {
    return dy >= 0 ? 'S' : 'N';
  }
}

// Opposite direction helper
function oppDir(dir) {
  if (dir === 'E') return 'W';
  if (dir === 'W') return 'E';
  if (dir === 'N') return 'S';
  if (dir === 'S') return 'N';
  if (dir === 'up') return 'down';
  if (dir === 'down') return 'up';
  return dir;
}

const nodes = {
  // ==========================================
  // FLOOR 0 - Apex Block Ground Floor (Level 200)
  // Image: apex-0th-floor.png (1587 x 2244)
  // ==========================================
  "J_F0_SW": { label: "Southwest Junction (Ground)", floor: 0, type: "junction", x: 250, y: 1650, aliases: ["SW Corner Ground"] },
  "J_F0_NW": { label: "Northwest Junction (Ground)", floor: 0, type: "junction", x: 250, y: 560, aliases: ["NW Corner Ground"] },
  "J_F0_NE": { label: "Northeast Junction (Ground)", floor: 0, type: "junction", x: 1220, y: 560, aliases: ["NE Corner Ground"] },
  "J_F0_SE": { label: "Southeast Lobby Junction (Ground)", floor: 0, type: "junction", x: 1220, y: 1650, aliases: ["SE Lobby Ground"] },

  // South Corridor Floor 0
  "R_AB_202": { label: "Room 202 (Chief Finance Office)", roomNumber: "202", floor: 0, type: "room", x: 380, y: 1650, aliases: ["Chief Finance Office", "AB 202", "202"] },
  "R_AB_201": { label: "Room 201 (Principal's Office)", roomNumber: "201", floor: 0, type: "room", x: 607, y: 1650, aliases: ["Principal Office", "Principal's Office", "AB 201", "201"] },
  "LIFT_F0_S": { label: "South Elevators (Ground)", floor: 0, type: "elevator", x: 950, y: 1650, aliases: ["South Lift Ground"] },
  "STAIRS_F0_S": { label: "South Stairwell (Ground)", floor: 0, type: "stairs", x: 1050, y: 1650, aliases: ["South Stairs Ground"] },

  // West Corridor Floor 0
  "R_AB_203": { label: "Room 203 (Registrar Office Academics)", roomNumber: "203", floor: 0, type: "room", x: 250, y: 1384, aliases: ["Registrar Academics", "AB 203", "203"] },
  "R_AB_204": { label: "Room 204 (Registrar Office Admin)", roomNumber: "204", floor: 0, type: "room", x: 250, y: 1145, aliases: ["Registrar Admin", "AB 204", "204"] },
  "STAIRS_F0_W": { label: "West Stairwell (Ground)", floor: 0, type: "stairs", x: 250, y: 850, aliases: ["West Stairs Ground"] },
  "LIFT_F0_W": { label: "West Courtyard Elevator (Ground)", floor: 0, type: "elevator", x: 250, y: 720, aliases: ["West Lift Ground"] },
  "R_AB_206": { label: "Room 206 (Chief Academic Advisor)", roomNumber: "206", floor: 0, type: "room", x: 250, y: 560, aliases: ["Academic Advisor", "AB 206", "206"] },

  // North Corridor Floor 0
  "R_AB_208": { label: "Room 208 (Ladies Lounge)", roomNumber: "208", floor: 0, type: "room", x: 739, y: 560, aliases: ["Ladies Lounge Ground", "AB 208", "208"] },
  "STAIRS_F0_N": { label: "North Stairwell (Ground)", floor: 0, type: "stairs", x: 800, y: 560, aliases: ["North Stairs Ground"] },
  "LIFT_F0_N": { label: "Courtyard North Elevator (Ground)", floor: 0, type: "elevator", x: 850, y: 560, aliases: ["North Lift Ground"] },
  "R_AB_209": { label: "Room 209 (Vice Principal Office)", roomNumber: "209", floor: 0, type: "room", x: 920, y: 560, aliases: ["Vice Principal", "AB 209", "209"] },
  "R_AB_210": { label: "Room 210 (Chief Executive Office)", roomNumber: "210", floor: 0, type: "room", x: 1080, y: 560, aliases: ["Chief Executive", "AB 210", "210"] },

  // East Corridor Floor 0
  "R_AB_212": { label: "Room 212 (Gents Restroom)", roomNumber: "212", floor: 0, type: "room", x: 1220, y: 705, aliases: ["Restroom Ground", "AB 212", "212"] },
  "R_AB_213": { label: "Room 213 (Admission & Scholarship)", roomNumber: "213", floor: 0, type: "room", x: 1220, y: 780, aliases: ["Admission Office", "Scholarship", "AB 213", "213"] },
  "R_AB_214": { label: "Room 214 (Accounts & Purchase)", roomNumber: "214", floor: 0, type: "room", x: 1220, y: 970, aliases: ["Accounts Office", "Purchase Office", "AB 214", "214"] },
  "LIFT_F0_SE": { label: "Southeast Elevators (Ground)", floor: 0, type: "elevator", x: 1220, y: 1273, aliases: ["SE Lift Ground", "Main Elevators Ground"] },
  "STAIRS_F0_SE": { label: "Southeast Stairwell (Ground)", floor: 0, type: "stairs", x: 1220, y: 1450, aliases: ["SE Stairs Ground"] },

  // ==========================================
  // FLOOR 1 - Apex Block 1st Floor (Level 300)
  // Image: apex-1st-floor.png (1587 x 2244)
  // ==========================================
  "J_F1_SW": { label: "Southwest Junction (F1)", floor: 1, type: "junction", x: 250, y: 1750, aliases: ["SW Corner Floor 1"] },
  "J_F1_NW": { label: "Northwest Junction (F1)", floor: 1, type: "junction", x: 250, y: 700, aliases: ["NW Corner Floor 1"] },
  "J_F1_NE": { label: "Northeast Junction (F1)", floor: 1, type: "junction", x: 1220, y: 700, aliases: ["NE Corner Floor 1"] },
  "J_F1_SE": { label: "Southeast Lobby Junction (F1)", floor: 1, type: "junction", x: 1220, y: 1750, aliases: ["SE Lobby Floor 1"] },

  // South Corridor Floor 1
  "R_AB_304": { label: "Room 304 (MSRIT Provident Fund)", roomNumber: "304", floor: 1, type: "room", x: 350, y: 1750, aliases: ["Provident Fund", "AB 304", "304"] },
  "R_AB_303": { label: "Room 303 (Student Counselling & First Aid)", roomNumber: "303", floor: 1, type: "room", x: 466, y: 1750, aliases: ["First Aid", "Counselling", "AB 303", "303"] },
  "R_AB_302": { label: "Room 302 (Internal Quality Assurance)", roomNumber: "302", floor: 1, type: "room", x: 659, y: 1750, aliases: ["IQAC", "Quality Assurance", "AB 302", "302"] },
  "R_AB_301": { label: "Room 301 (Valuation Center I)", roomNumber: "301", floor: 1, type: "room", x: 852, y: 1750, aliases: ["Valuation Center", "AB 301", "301"] },
  "LIFT_F1_S": { label: "South Elevators (F1)", floor: 1, type: "elevator", x: 1109, y: 1750, aliases: ["South Lift Floor 1"] },
  "STAIRS_F1_S": { label: "South Stairwell (F1)", floor: 1, type: "stairs", x: 1160, y: 1750, aliases: ["South Stairs Floor 1"] },

  // West Corridor Floor 1
  "R_AB_305": { label: "Room 305 (NSS Office)", roomNumber: "305", floor: 1, type: "room", x: 250, y: 1650, aliases: ["NSS", "AB 305", "305"] },
  "R_AB_306": { label: "Room 306 (Admission Section)", roomNumber: "306", floor: 1, type: "room", x: 250, y: 1505, aliases: ["Admission Section", "AB 306", "306"] },
  "STAIRS_F1_W": { label: "West Stairwell (F1)", floor: 1, type: "stairs", x: 250, y: 1150, aliases: ["West Stairs Floor 1"] },
  "LIFT_F1_W": { label: "West Courtyard Elevator (F1)", floor: 1, type: "elevator", x: 250, y: 980, aliases: ["West Lift Floor 1"] },

  // North Corridor Floor 1
  "R_AB_310": { label: "Room 310 (Power Room)", roomNumber: "310", floor: 1, type: "room", x: 715, y: 700, aliases: ["Power Room", "AB 310", "310"] },
  "STAIRS_F1_N": { label: "North Stairwell (F1)", floor: 1, type: "stairs", x: 750, y: 700, aliases: ["North Stairs Floor 1"] },
  "LIFT_F1_N": { label: "Courtyard North Elevator (F1)", floor: 1, type: "elevator", x: 780, y: 700, aliases: ["North Lift Floor 1"] },
  "R_AB_311": { label: "Room 311 (Ladies Restroom)", roomNumber: "311", floor: 1, type: "room", x: 798, y: 700, aliases: ["Ladies Restroom F1", "AB 311", "311"] },

  // East Corridor Floor 1
  "R_AB_313": { label: "Room 313 (Gents Restroom)", roomNumber: "313", floor: 1, type: "room", x: 1220, y: 940, aliases: ["Gents Restroom F1", "AB 313", "313"] },
  "R_AB_314": { label: "Room 314 (Server Room)", roomNumber: "314", floor: 1, type: "room", x: 1220, y: 1040, aliases: ["Server Room", "Data Center", "AB 314", "314"] },
  "R_AB_315": { label: "Room 315 (IT Service Center)", roomNumber: "315", floor: 1, type: "room", x: 1220, y: 1133, aliases: ["IT Service", "Helpdesk", "AB 315", "315"] },
  "R_AB_316": { label: "Room 316 (Doctoral Program Office)", roomNumber: "316", floor: 1, type: "room", x: 1220, y: 1229, aliases: ["Doctoral Program", "PhD Office", "AB 316", "316"] },
  "R_AB_317": { label: "Room 317 (Chief Proctor Office)", roomNumber: "317", floor: 1, type: "room", x: 1220, y: 1350, aliases: ["Chief Proctor", "AB 317", "317"] },
  "LIFT_F1_SE": { label: "Southeast Elevators (F1)", floor: 1, type: "elevator", x: 1220, y: 1518, aliases: ["SE Lift Floor 1"] },
  "STAIRS_F1_SE": { label: "Southeast Stairwell (F1)", floor: 1, type: "stairs", x: 1220, y: 1630, aliases: ["SE Stairs Floor 1"] },

  // ==========================================
  // FLOOR 2 - Apex Block 2nd Floor (MCA Block)
  // Image: apex-2nd-floor.jpeg (1600 x 1515)
  // ==========================================
  "J_F2_SW": { label: "Southwest Junction (F2)", floor: 2, type: "junction", x: 305, y: 1035, aliases: ["SW Corner Floor 2"] },
  "J_F2_NW": { label: "Northwest Junction (F2)", floor: 2, type: "junction", x: 305, y: 330, aliases: ["NW Corner Floor 2"] },
  "J_F2_NE": { label: "Northeast Junction (F2)", floor: 2, type: "junction", x: 1075, y: 330, aliases: ["NE Corner Floor 2"] },
  "J_F2_SE": { label: "Southeast Lobby Junction (F2)", floor: 2, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby Floor 2"] },
  "J_F2_SKY": { label: "Skybridge Passage (F2)", floor: 2, type: "junction", x: 1220, y: 1035, aliases: ["MCA Skybridge Floor 2"] },

  // South Corridor Floor 2
  "R_MCA_CR1": { label: "Room 403 (MCA Classroom 1)", roomNumber: "403", floor: 2, type: "room", x: 380, y: 1035, aliases: ["MCA Classroom 1", "Room 403", "403"] },
  "R_MCA_CR2": { label: "Room 402 (MCA Classroom 2)", roomNumber: "402", floor: 2, type: "room", x: 520, y: 1035, aliases: ["MCA Classroom 2", "Room 402", "402"] },
  "R_MCA_CR3": { label: "Room 401 (MCA Classroom 3)", roomNumber: "401", floor: 2, type: "room", x: 800, y: 1035, aliases: ["MCA Classroom 3", "Room 401", "401"] },
  "LIFT_F2_S": { label: "South Elevators (F2)", floor: 2, type: "elevator", x: 940, y: 1035, aliases: ["South Lift Floor 2"] },
  "STAIRS_F2_S": { label: "South Stairwell (F2)", floor: 2, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs Floor 2"] },
  "R_MCA_LIB": { label: "Room 416 (MCA Department Library)", roomNumber: "416", floor: 2, type: "room", x: 1350, y: 1200, aliases: ["MCA Library", "Room 416", "416"] },

  // West Corridor Floor 2
  "R_MCA_STAFF": { label: "Room 404 (MCA Staff Room)", roomNumber: "404", floor: 2, type: "room", x: 305, y: 930, aliases: ["MCA Faculty", "Staff Room MCA", "Room 404", "404"] },
  "STAIRS_F2_W": { label: "West Stairwell (F2)", floor: 2, type: "stairs", x: 305, y: 750, aliases: ["West Stairs Floor 2"] },
  "LIFT_F2_W": { label: "West Courtyard Elevator (F2)", floor: 2, type: "elevator", x: 305, y: 620, aliases: ["West Lift Floor 2"] },
  "R_MCA_SKILL": { label: "Room 405 (MCA Skill Development Lab)", roomNumber: "405", floor: 2, type: "room", x: 305, y: 460, aliases: ["Skill Lab", "MCA Skill Lab", "405"] },

  // North Corridor Floor 2
  "R_MCA_LAB1": { label: "Room 407 (MCA Computer Lab)", roomNumber: "407", floor: 2, type: "room", x: 445, y: 330, aliases: ["MCA Computer Lab", "MCA Lab", "407"] },
  "STAIRS_F2_N": { label: "North Stairwell (F2)", floor: 2, type: "stairs", x: 680, y: 330, aliases: ["North Stairs Floor 2"] },
  "LIFT_F2_N": { label: "Courtyard North Elevator (F2)", floor: 2, type: "elevator", x: 780, y: 330, aliases: ["North Lift Floor 2"] },
  "R_MCA_EVAL": { label: "Room 408 (Evaluation Center 2)", roomNumber: "408", floor: 2, type: "room", x: 980, y: 330, aliases: ["Evaluation Center", "408"] },

  // East Corridor Floor 2
  "R_MCA_SEM": { label: "Room 412 (MCA Seminar Room)", roomNumber: "412", floor: 2, type: "room", x: 1075, y: 420, aliases: ["MCA Seminar", "412"] },
  "R_MCA_OFFICE": { label: "Room 414 (MCA Department Office)", roomNumber: "414", floor: 2, type: "room", x: 1075, y: 540, aliases: ["MCA Office", "414"] },
  "R_MCA_CONF": { label: "Room 415 (MCA Conference Room)", roomNumber: "415", floor: 2, type: "room", x: 1075, y: 720, aliases: ["MCA Conference", "415"] },
  "LIFT_F2_SE": { label: "Southeast Elevators (F2)", floor: 2, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift Floor 2"] },
  "STAIRS_F2_SE": { label: "Southeast Stairwell (F2)", floor: 2, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs Floor 2"] },

  // ==========================================
  // FLOOR 3 - Apex Block 3rd Floor (Level 500)
  // Image: apex-3rd-floor.jpeg (1600 x 1515)
  // ==========================================
  "J_F3_SW": { label: "Southwest Junction (F3)", floor: 3, type: "junction", x: 305, y: 1035, aliases: ["SW Corner Floor 3"] },
  "J_F3_NW": { label: "Northwest Junction (F3)", floor: 3, type: "junction", x: 305, y: 330, aliases: ["NW Corner Floor 3"] },
  "J_F3_NE": { label: "Northeast Junction (F3)", floor: 3, type: "junction", x: 1075, y: 330, aliases: ["NE Corner Floor 3"] },
  "J_F3_SE": { label: "Southeast Lobby Junction (F3)", floor: 3, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby Floor 3"] },
  "J_F3_SKY": { label: "Skybridge Passage (F3)", floor: 3, type: "junction", x: 1220, y: 1035, aliases: ["Auditorium Skybridge Floor 3"] },

  // South Corridor Floor 3
  "R_AB_503": { label: "Room 503", roomNumber: "503", floor: 3, type: "room", x: 380, y: 1035, aliases: ["Classroom 503", "AB 503", "503"] },
  "R_AB_502": { label: "Room 502", roomNumber: "502", floor: 3, type: "room", x: 520, y: 1035, aliases: ["Classroom 502", "AB 502", "502"] },
  "R_AB_501": { label: "Room 501", roomNumber: "501", floor: 3, type: "room", x: 800, y: 1035, aliases: ["Classroom 501", "AB 501", "501"] },
  "LIFT_F3_S": { label: "South Elevators (F3)", floor: 3, type: "elevator", x: 940, y: 1035, aliases: ["South Lift Floor 3"] },
  "STAIRS_F3_S": { label: "South Stairwell (F3)", floor: 3, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs Floor 3"] },
  "R_AB_516": { label: "Room 516 (Lecture & Seminar Hall)", roomNumber: "516", floor: 3, type: "room", x: 1350, y: 1200, aliases: ["Lecture Hall 516", "Room 516", "Seminar Hall", "516"] },

  // West Corridor Floor 3
  "R_AB_504": { label: "Room 504", roomNumber: "504", floor: 3, type: "room", x: 305, y: 930, aliases: ["Classroom 504", "AB 504", "504"] },
  "STAIRS_F3_W": { label: "West Stairwell (F3)", floor: 3, type: "stairs", x: 305, y: 750, aliases: ["West Stairs Floor 3"] },
  "LIFT_F3_W": { label: "West Courtyard Elevator (F3)", floor: 3, type: "elevator", x: 305, y: 620, aliases: ["West Lift Floor 3"] },
  "R_AB_505": { label: "Room 505", roomNumber: "505", floor: 3, type: "room", x: 305, y: 460, aliases: ["Classroom 505", "AB 505", "505"] },

  // North Corridor Floor 3
  "R_AB_506": { label: "Room 506", roomNumber: "506", floor: 3, type: "room", x: 380, y: 330, aliases: ["Classroom 506", "AB 506", "506"] },
  "R_AB_507": { label: "Room 507", roomNumber: "507", floor: 3, type: "room", x: 460, y: 330, aliases: ["Classroom 507", "AB 507", "507"] },
  "R_AB_508": { label: "Room 508", roomNumber: "508", floor: 3, type: "room", x: 580, y: 330, aliases: ["Classroom 508", "AB 508", "508"] },
  "STAIRS_F3_N": { label: "North Stairwell (F3)", floor: 3, type: "stairs", x: 680, y: 330, aliases: ["North Stairs Floor 3"] },
  "LIFT_F3_N": { label: "Courtyard North Elevator (F3)", floor: 3, type: "elevator", x: 780, y: 330, aliases: ["North Lift Floor 3"] },
  "R_AB_510": { label: "Room 510", roomNumber: "510", floor: 3, type: "room", x: 880, y: 330, aliases: ["Classroom 510", "AB 510", "510"] },
  "R_AB_511": { label: "Room 511", roomNumber: "511", floor: 3, type: "room", x: 980, y: 330, aliases: ["Classroom 511", "AB 511", "511"] },

  // East Corridor Floor 3
  "R_AB_512": { label: "Room 512", roomNumber: "512", floor: 3, type: "room", x: 1075, y: 420, aliases: ["Classroom 512", "AB 512", "512"] },
  "R_AB_514": { label: "Room 514", roomNumber: "514", floor: 3, type: "room", x: 1075, y: 540, aliases: ["Classroom 514", "AB 514", "514"] },
  "R_AB_515": { label: "Room 515", roomNumber: "515", floor: 3, type: "room", x: 1075, y: 720, aliases: ["Classroom 515", "AB 515", "515"] },
  "LIFT_F3_SE": { label: "Southeast Elevators (F3)", floor: 3, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift Floor 3"] },
  "STAIRS_F3_SE": { label: "Southeast Stairwell (F3)", floor: 3, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs Floor 3"] },

  // ==========================================
  // FLOOR 4 - Apex Block 4th Floor (Level 600)
  // Image: apex-4th-floor.jpeg (1600 x 1515)
  // ==========================================
  "J_F4_SW": { label: "Southwest Junction (F4)", floor: 4, type: "junction", x: 305, y: 1035, aliases: ["SW Corner Floor 4", "SW Junction"] },
  "J_F4_NW": { label: "Northwest Junction (F4)", floor: 4, type: "junction", x: 305, y: 330, aliases: ["NW Corner Floor 4", "NW Junction"] },
  "J_F4_NE": { label: "Northeast Junction (F4)", floor: 4, type: "junction", x: 1075, y: 330, aliases: ["NE Corner Floor 4", "NE Junction"] },
  "J_F4_SE": { label: "Southeast Lobby Junction (F4)", floor: 4, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby Floor 4", "SE Junction"] },
  "J_F4_SKY": { label: "Skybridge Passage (F4)", floor: 4, type: "junction", x: 1220, y: 1035, aliases: ["Board Room Skybridge Floor 4"] },

  // South Corridor Floor 4
  "R_AB_603": { label: "Room 603", roomNumber: "603", floor: 4, type: "room", x: 380, y: 1035, aliases: ["Classroom 603", "AB 603", "603"] },
  "R_AB_602": { label: "Room 602", roomNumber: "602", floor: 4, type: "room", x: 520, y: 1035, aliases: ["Classroom 602", "AB 602", "602"] },
  "R_AB_601": { label: "Room 601", roomNumber: "601", floor: 4, type: "room", x: 800, y: 1035, aliases: ["Classroom 601", "AB 601", "601"] },
  "LIFT_F4_S": { label: "South Elevators (F4)", floor: 4, type: "elevator", x: 940, y: 1035, aliases: ["South Lift Floor 4", "South Elevators"] },
  "STAIRS_F4_S": { label: "South Stairwell (F4)", floor: 4, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs Floor 4", "South Stairwell"] },
  "R_BOARD_ROOM": { label: "Room 612 (Board Room)", roomNumber: "612", floor: 4, type: "room", x: 1350, y: 1200, aliases: ["Board Room", "Executive Board Room", "612"] },

  // West Corridor Floor 4
  "R_AB_604": { label: "Room 604", roomNumber: "604", floor: 4, type: "room", x: 305, y: 930, aliases: ["Classroom 604", "AB 604", "604"] },
  "STAIRS_F4_W": { label: "West Stairwell (F4)", floor: 4, type: "stairs", x: 305, y: 750, aliases: ["West Stairs Floor 4", "West Stairwell"] },
  "LIFT_F4_W": { label: "West Courtyard Elevator (F4)", floor: 4, type: "elevator", x: 305, y: 620, aliases: ["West Lift Floor 4", "West Courtyard Elevator"] },
  "R_PHYSICS_W": { label: "Room 605 (Physics Lab West)", roomNumber: "605", floor: 4, type: "room", x: 305, y: 460, aliases: ["Physics Lab West", "Physics Laboratory West Wing", "605"] },

  // North Corridor Floor 4
  "R_PHYSICS_NW": { label: "Room 607 (Main Physics Lab)", roomNumber: "607", floor: 4, type: "room", x: 460, y: 330, aliases: ["Main Physics Lab", "Physics Lab NW", "607"] },
  "STAIRS_F4_N": { label: "North Stairwell (F4)", floor: 4, type: "stairs", x: 680, y: 330, aliases: ["North Stairs Floor 4", "North Stairwell"] },
  "LIFT_F4_N": { label: "Courtyard North Elevator (F4)", floor: 4, type: "elevator", x: 780, y: 330, aliases: ["North Lift Floor 4", "Courtyard North Elevator"] },
  "R_AB_608": { label: "Room 608", roomNumber: "608", floor: 4, type: "room", x: 980, y: 330, aliases: ["Classroom 608", "AB 608", "608"] },

  // East Corridor Floor 4
  "WASHROOM_F4_M": { label: "Washroom (Floor 4)", roomNumber: "609", floor: 4, type: "room", x: 1075, y: 420, aliases: ["Male Washroom", "Restroom Floor 4", "609"] },
  "R_AB_610": { label: "Room 610", roomNumber: "610", floor: 4, type: "room", x: 1075, y: 540, aliases: ["Classroom 610", "AB 610", "610"] },
  "R_AB_611": { label: "Room 611", roomNumber: "611", floor: 4, type: "room", x: 1075, y: 720, aliases: ["Classroom 611", "AB 611", "611"] },
  "LIFT_F4_SE": { label: "Southeast Elevators (F4)", floor: 4, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift Floor 4", "Southeast Elevators"] },
  "STAIRS_F4_SE": { label: "Southeast Stairwell (F4)", floor: 4, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs Floor 4", "Southeast Stairwell"] },

  // ==========================================
  // FLOOR 5 - Apex Block 5th Floor (Level 700)
  // Image: apex-5th-floor.jpeg (1600 x 1515)
  // ==========================================
  "J_F5_SW": { label: "Southwest Junction (F5)", floor: 5, type: "junction", x: 305, y: 1035, aliases: ["SW Corner Floor 5"] },
  "J_F5_NW": { label: "Northwest Junction (F5)", floor: 5, type: "junction", x: 305, y: 330, aliases: ["NW Corner Floor 5"] },
  "J_F5_NE": { label: "Northeast Junction (F5)", floor: 5, type: "junction", x: 1075, y: 330, aliases: ["NE Corner Floor 5"] },
  "J_F5_SE": { label: "Southeast Lobby Junction (F5)", floor: 5, type: "junction", x: 1075, y: 1035, aliases: ["SE Lobby Floor 5"] },
  "J_F5_SKY": { label: "Skybridge Passage (F5)", floor: 5, type: "junction", x: 1220, y: 1035, aliases: ["Apex Library Bridge Floor 5"] },

  // South Corridor Floor 5
  "R_AB_702": { label: "Room 702", roomNumber: "702", floor: 5, type: "room", x: 520, y: 1035, aliases: ["Classroom 702", "AB 702", "702"] },
  "R_AB_701": { label: "Room 701", roomNumber: "701", floor: 5, type: "room", x: 800, y: 1035, aliases: ["Classroom 701", "AB 701", "701"] },
  "LIFT_F5_S": { label: "South Elevators (F5)", floor: 5, type: "elevator", x: 940, y: 1035, aliases: ["South Lift Floor 5"] },
  "STAIRS_F5_S": { label: "South Stairwell (F5)", floor: 5, type: "stairs", x: 1010, y: 1035, aliases: ["South Stairs Floor 5"] },
  "R_APEX_LIB": { label: "Room 712 (Apex Central Library)", roomNumber: "712", floor: 5, type: "room", x: 1350, y: 1200, aliases: ["Apex Library", "Central Library", "Library Floor 5", "712"] },

  // West Corridor Floor 5
  "R_COMP_LAB_SW": { label: "Room 703 (Computer Lab SW)", roomNumber: "703", floor: 5, type: "room", x: 305, y: 930, aliases: ["Advanced Computing Lab", "CS Lab SW", "703"] },
  "STAIRS_F5_W": { label: "West Stairwell (F5)", floor: 5, type: "stairs", x: 305, y: 750, aliases: ["West Stairs Floor 5"] },
  "LIFT_F5_W": { label: "West Courtyard Elevator (F5)", floor: 5, type: "elevator", x: 305, y: 620, aliases: ["West Lift Floor 5"] },
  "R_MATH_STAFF_W": { label: "Room 704 (Math Staff Room W)", roomNumber: "704", floor: 5, type: "room", x: 305, y: 460, aliases: ["Mathematics Faculty West", "Staff Room 7", "704"] },

  // North Corridor Floor 5
  "R_COMP_LAB_NW": { label: "Room 705 (Computer Lab NW)", roomNumber: "705", floor: 5, type: "room", x: 380, y: 330, aliases: ["Computing Lab NW", "Systems Lab", "705"] },
  "R_HUMANITIES": { label: "Room 706 (Dept. Humanities)", roomNumber: "706", floor: 5, type: "room", x: 460, y: 330, aliases: ["Humanities Department", "Language Lab", "706"] },
  "STAIRS_F5_N": { label: "North Stairwell (F5)", floor: 5, type: "stairs", x: 680, y: 330, aliases: ["North Stairs Floor 5"] },
  "LIFT_F5_N": { label: "Courtyard North Elevator (F5)", floor: 5, type: "elevator", x: 780, y: 330, aliases: ["North Lift Floor 5"] },
  "R_STAFF_LIB": { label: "Room 707 (Faculty Staff Library)", roomNumber: "707", floor: 5, type: "room", x: 880, y: 330, aliases: ["Professors Library", "Reference Room", "707"] },
  "R_STAFF_MEET": { label: "Room 708 (Staff Meeting Room)", roomNumber: "708", floor: 5, type: "room", x: 980, y: 330, aliases: ["Meeting Hall 7", "Conference Room", "708"] },

  // East Corridor Floor 5
  "R_MATH_STAFF_NE": { label: "Room 709 (Math Staff Room NE)", roomNumber: "709", floor: 5, type: "room", x: 1075, y: 420, aliases: ["Mathematics Faculty NE", "709"] },
  "R_MATH_DEPT": { label: "Room 710 (Dept. Mathematics)", roomNumber: "710", floor: 5, type: "room", x: 1075, y: 600, aliases: ["Math Department Main Office", "710"] },
  "LIFT_F5_SE": { label: "Southeast Elevators (F5)", floor: 5, type: "elevator", x: 1075, y: 870, aliases: ["SE Lift Floor 5"] },
  "STAIRS_F5_SE": { label: "Southeast Stairwell (F5)", floor: 5, type: "stairs", x: 1075, y: 950, aliases: ["SE Stairs Floor 5"] },

  // ==========================================
  // FLOOR 6 - Apex Block 6th Floor (Level 800)
  // Image: apex-6th-floor.png (1587 x 2244)
  // ==========================================
  "J_F6_SW": { label: "Southwest Junction (F6)", floor: 6, type: "junction", x: 330, y: 1600, aliases: ["SW Corner Floor 6"] },
  "J_F6_NW": { label: "Northwest Junction (F6)", floor: 6, type: "junction", x: 330, y: 750, aliases: ["NW Corner Floor 6"] },
  "J_F6_NE": { label: "Northeast Junction (F6)", floor: 6, type: "junction", x: 1200, y: 750, aliases: ["NE Corner Floor 6"] },
  "J_F6_SE": { label: "Southeast Lobby Junction (F6)", floor: 6, type: "junction", x: 1200, y: 1600, aliases: ["SE Lobby Floor 6"] },

  // South Corridor Floor 6
  "LIFT_F6_S": { label: "South Elevators (F6)", floor: 6, type: "elevator", x: 837, y: 1600, aliases: ["South Lift Floor 6"] },
  "STAIRS_F6_S": { label: "South Stairwell (F6)", floor: 6, type: "stairs", x: 950, y: 1600, aliases: ["South Stairs Floor 6"] },

  // West Corridor Floor 6
  "R_AB_804A": { label: "Room 804/A (Classroom)", roomNumber: "804A", floor: 6, type: "room", x: 330, y: 872, aliases: ["Room 804A", "804A"] },
  "LIFT_F6_W": { label: "West Courtyard Elevator (F6)", floor: 6, type: "elevator", x: 330, y: 1057, aliases: ["West Lift Floor 6"] },
  "STAIRS_F6_W": { label: "West Stairwell (F6)", floor: 6, type: "stairs", x: 330, y: 1200, aliases: ["West Stairs Floor 6"] },

  // North Corridor Floor 6
  "R_AUDITORIUM": { label: "Apex Grand Auditorium", roomNumber: "801", floor: 6, type: "room", x: 450, y: 750, aliases: ["Auditorium", "Main Auditorium", "801"] },
  "R_POWER_HOUSE": { label: "Power House", roomNumber: "802", floor: 6, type: "room", x: 775, y: 750, aliases: ["Power House", "Substation", "802"] },
  "STAIRS_F6_N": { label: "North Stairwell (F6)", floor: 6, type: "stairs", x: 950, y: 750, aliases: ["North Stairs Floor 6"] },
  "LIFT_F6_N": { label: "Courtyard North Elevator (F6)", floor: 6, type: "elevator", x: 1050, y: 750, aliases: ["North Lift Floor 6"] },
  "R_SCHOLARS_LOUNGE": { label: "Research Scholars Lounge", roomNumber: "803", floor: 6, type: "room", x: 1200, y: 750, aliases: ["Scholars Lounge", "Research Lounge", "803"] },

  // East Corridor Floor 6
  "R_AB_807A": { label: "Room 807A (AIDS Classroom)", roomNumber: "807A", floor: 6, type: "room", x: 1200, y: 970, aliases: ["AIDS Class 807A", "807A"] },
  "R_AB_807B": { label: "Room 807B (AIDS Classroom)", roomNumber: "807B", floor: 6, type: "room", x: 1200, y: 1250, aliases: ["AIDS Class 807B", "807B"] },
  "LIFT_F6_SE": { label: "Southeast Elevators (F6)", floor: 6, type: "elevator", x: 1200, y: 1450, aliases: ["SE Lift Floor 6"] },
  "STAIRS_F6_SE": { label: "Southeast Stairwell (F6)", floor: 6, type: "stairs", x: 1200, y: 1530, aliases: ["SE Stairs Floor 6"] }
};

// Corridor Chains for each floor
const corridorChains = [
  // --- Floor 0 (Ground) ---
  ["J_F0_SW", "R_AB_202", "R_AB_201", "LIFT_F0_S", "STAIRS_F0_S", "J_F0_SE"],
  ["J_F0_SW", "R_AB_203", "R_AB_204", "STAIRS_F0_W", "LIFT_F0_W", "R_AB_206", "J_F0_NW"],
  ["J_F0_NW", "R_AB_208", "STAIRS_F0_N", "LIFT_F0_N", "R_AB_209", "R_AB_210", "J_F0_NE"],
  ["J_F0_NE", "R_AB_212", "R_AB_213", "R_AB_214", "LIFT_F0_SE", "STAIRS_F0_SE", "J_F0_SE"],

  // --- Floor 1 ---
  ["J_F1_SW", "R_AB_304", "R_AB_303", "R_AB_302", "R_AB_301", "LIFT_F1_S", "STAIRS_F1_S", "J_F1_SE"],
  ["J_F1_SW", "R_AB_305", "R_AB_306", "STAIRS_F1_W", "LIFT_F1_W", "J_F1_NW"],
  ["J_F1_NW", "R_AB_310", "STAIRS_F1_N", "LIFT_F1_N", "R_AB_311", "J_F1_NE"],
  ["J_F1_NE", "R_AB_313", "R_AB_314", "R_AB_315", "R_AB_316", "R_AB_317", "LIFT_F1_SE", "STAIRS_F1_SE", "J_F1_SE"],

  // --- Floor 2 (MCA) ---
  ["J_F2_SW", "R_MCA_CR1", "R_MCA_CR2", "R_MCA_CR3", "LIFT_F2_S", "STAIRS_F2_S", "J_F2_SE"],
  ["J_F2_SE", "J_F2_SKY", "R_MCA_LIB"],
  ["J_F2_SW", "R_MCA_STAFF", "STAIRS_F2_W", "LIFT_F2_W", "R_MCA_SKILL", "J_F2_NW"],
  ["J_F2_NW", "R_MCA_LAB1", "STAIRS_F2_N", "LIFT_F2_N", "R_MCA_EVAL", "J_F2_NE"],
  ["J_F2_NE", "R_MCA_SEM", "R_MCA_OFFICE", "R_MCA_CONF", "LIFT_F2_SE", "STAIRS_F2_SE", "J_F2_SE"],

  // --- Floor 3 ---
  ["J_F3_SW", "R_AB_503", "R_AB_502", "R_AB_501", "LIFT_F3_S", "STAIRS_F3_S", "J_F3_SE"],
  ["J_F3_SE", "J_F3_SKY", "R_AB_516"],
  ["J_F3_SW", "R_AB_504", "STAIRS_F3_W", "LIFT_F3_W", "R_AB_505", "J_F3_NW"],
  ["J_F3_NW", "R_AB_506", "R_AB_507", "R_AB_508", "STAIRS_F3_N", "LIFT_F3_N", "R_AB_510", "R_AB_511", "J_F3_NE"],
  ["J_F3_NE", "R_AB_512", "R_AB_514", "R_AB_515", "LIFT_F3_SE", "STAIRS_F3_SE", "J_F3_SE"],

  // --- Floor 4 ---
  ["J_F4_SW", "R_AB_603", "R_AB_602", "R_AB_601", "LIFT_F4_S", "STAIRS_F4_S", "J_F4_SE"],
  ["J_F4_SE", "J_F4_SKY", "R_BOARD_ROOM"],
  ["J_F4_SW", "R_AB_604", "STAIRS_F4_W", "LIFT_F4_W", "R_PHYSICS_W", "J_F4_NW"],
  ["J_F4_NW", "R_PHYSICS_NW", "STAIRS_F4_N", "LIFT_F4_N", "R_AB_608", "J_F4_NE"],
  ["J_F4_NE", "WASHROOM_F4_M", "R_AB_610", "R_AB_611", "LIFT_F4_SE", "STAIRS_F4_SE", "J_F4_SE"],

  // --- Floor 5 ---
  ["J_F5_SW", "R_AB_702", "R_AB_701", "LIFT_F5_S", "STAIRS_F5_S", "J_F5_SE"],
  ["J_F5_SE", "J_F5_SKY", "R_APEX_LIB"],
  ["J_F5_SW", "R_COMP_LAB_SW", "STAIRS_F5_W", "LIFT_F5_W", "R_MATH_STAFF_W", "J_F5_NW"],
  ["J_F5_NW", "R_COMP_LAB_NW", "R_HUMANITIES", "STAIRS_F5_N", "LIFT_F5_N", "R_STAFF_LIB", "R_STAFF_MEET", "J_F5_NE"],
  ["J_F5_NE", "R_MATH_STAFF_NE", "R_MATH_DEPT", "LIFT_F5_SE", "STAIRS_F5_SE", "J_F5_SE"],

  // --- Floor 6 ---
  ["J_F6_SW", "LIFT_F6_S", "STAIRS_F6_S", "J_F6_SE"],
  ["J_F6_SW", "STAIRS_F6_W", "LIFT_F6_W", "R_AB_804A", "J_F6_NW"],
  ["J_F6_NW", "R_AUDITORIUM", "R_POWER_HOUSE", "STAIRS_F6_N", "LIFT_F6_N", "R_SCHOLARS_LOUNGE", "J_F6_NE"],
  ["J_F6_NE", "R_AB_807A", "R_AB_807B", "LIFT_F6_SE", "STAIRS_F6_SE", "J_F6_SE"]
];

const edges = [];
const seenEdges = new Set();

function addEdge(u, v, weight, direction, options = {}) {
  const edgeKey = `${u}__${v}`;
  if (seenEdges.has(edgeKey)) return;
  seenEdges.add(edgeKey);
  edges.push({
    from: u,
    to: v,
    weight: weight,
    direction: direction,
    ...options
  });
}

// Generate bidirectional edges for all hallway corridor chains
for (const chain of corridorChains) {
  for (let i = 0; i < chain.length - 1; i++) {
    const u = chain[i];
    const v = chain[i + 1];
    const nodeU = nodes[u];
    const nodeV = nodes[v];
    if (!nodeU || !nodeV) {
      console.error(`Missing node: ${u} or ${v}`);
      continue;
    }
    const dist = calcDist(nodeU, nodeV);
    const dirFwd = getDirection(nodeU, nodeV);
    const dirRev = oppDir(dirFwd);
    const isStairs = nodeU.type === 'stairs' && nodeV.type === 'stairs';
    const isAccessible = !isStairs;

    // Forward edge
    addEdge(u, v, dist, dirFwd, { isAccessible });
    // Reverse edge (walk both ways along corridor)
    addEdge(v, u, dist, dirRev, { isAccessible });
  }
}

// Multi-floor vertical edges: Elevators (weight 15 m) & Stairs (weight 25 m)
const verticalConnections = [
  // Southeast Elevators (Floors 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6)
  { from: "LIFT_F0_SE", to: "LIFT_F1_SE", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F1_SE", to: "LIFT_F2_SE", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F2_SE", to: "LIFT_F3_SE", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F3_SE", to: "LIFT_F4_SE", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F4_SE", to: "LIFT_F5_SE", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F5_SE", to: "LIFT_F6_SE", type: "elevator", weight: 15, isAccessible: true },

  // South Elevators (Floors 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6)
  { from: "LIFT_F0_S", to: "LIFT_F1_S", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F1_S", to: "LIFT_F2_S", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F2_S", to: "LIFT_F3_S", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F3_S", to: "LIFT_F4_S", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F4_S", to: "LIFT_F5_S", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F5_S", to: "LIFT_F6_S", type: "elevator", weight: 15, isAccessible: true },

  // West Elevators (Floors 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6)
  { from: "LIFT_F0_W", to: "LIFT_F1_W", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F1_W", to: "LIFT_F2_W", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F2_W", to: "LIFT_F3_W", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F3_W", to: "LIFT_F4_W", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F4_W", to: "LIFT_F5_W", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F5_W", to: "LIFT_F6_W", type: "elevator", weight: 15, isAccessible: true },

  // North Elevators (Floors 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6)
  { from: "LIFT_F0_N", to: "LIFT_F1_N", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F1_N", to: "LIFT_F2_N", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F2_N", to: "LIFT_F3_N", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F3_N", to: "LIFT_F4_N", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F4_N", to: "LIFT_F5_N", type: "elevator", weight: 15, isAccessible: true },
  { from: "LIFT_F5_N", to: "LIFT_F6_N", type: "elevator", weight: 15, isAccessible: true },

  // Southeast Stairs (Floors 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6)
  { from: "STAIRS_F0_SE", to: "STAIRS_F1_SE", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F1_SE", to: "STAIRS_F2_SE", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F2_SE", to: "STAIRS_F3_SE", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F3_SE", to: "STAIRS_F4_SE", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F4_SE", to: "STAIRS_F5_SE", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F5_SE", to: "STAIRS_F6_SE", type: "stairs", weight: 25, isAccessible: false },

  // South Stairs
  { from: "STAIRS_F0_S", to: "STAIRS_F1_S", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F1_S", to: "STAIRS_F2_S", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F2_S", to: "STAIRS_F3_S", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F3_S", to: "STAIRS_F4_S", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F4_S", to: "STAIRS_F5_S", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F5_S", to: "STAIRS_F6_S", type: "stairs", weight: 25, isAccessible: false },

  // West Stairs
  { from: "STAIRS_F0_W", to: "STAIRS_F1_W", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F1_W", to: "STAIRS_F2_W", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F2_W", to: "STAIRS_F3_W", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F3_W", to: "STAIRS_F4_W", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F4_W", to: "STAIRS_F5_W", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F5_W", to: "STAIRS_F6_W", type: "stairs", weight: 25, isAccessible: false },

  // North Stairs
  { from: "STAIRS_F0_N", to: "STAIRS_F1_N", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F1_N", to: "STAIRS_F2_N", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F2_N", to: "STAIRS_F3_N", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F3_N", to: "STAIRS_F4_N", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F4_N", to: "STAIRS_F5_N", type: "stairs", weight: 25, isAccessible: false },
  { from: "STAIRS_F5_N", to: "STAIRS_F6_N", type: "stairs", weight: 25, isAccessible: false }
];

for (const conn of verticalConnections) {
  addEdge(conn.from, conn.to, conn.weight, "up", { isAccessible: conn.isAccessible, verticalType: conn.type });
  addEdge(conn.to, conn.from, conn.weight, "down", { isAccessible: conn.isAccessible, verticalType: conn.type });
}

const campusGraph = {
  floors: {
    "0": {
      name: "Apex Block - Ground Floor",
      planImage: "/assets/floor-plans/reference/apex-0th-floor.png",
      width: 1587,
      height: 2244
    },
    "1": {
      name: "Apex Block - Floor 1",
      planImage: "/assets/floor-plans/reference/apex-1st-floor.png",
      width: 1587,
      height: 2244
    },
    "2": {
      name: "Apex Block - Floor 2",
      planImage: "/assets/floor-plans/reference/apex-2nd-floor.jpeg",
      width: 1600,
      height: 1515
    },
    "3": {
      name: "Apex Block - Floor 3",
      planImage: "/assets/floor-plans/reference/apex-3rd-floor.jpeg",
      width: 1600,
      height: 1515
    },
    "4": {
      name: "Apex Block - Floor 4",
      planImage: "/assets/floor-plans/reference/apex-4th-floor.jpeg",
      width: 1600,
      height: 1515
    },
    "5": {
      name: "Apex Block - Floor 5",
      planImage: "/assets/floor-plans/reference/apex-5th-floor.jpeg",
      width: 1600,
      height: 1515
    },
    "6": {
      name: "Apex Block - Floor 6",
      planImage: "/assets/floor-plans/reference/apex-6th-floor.png",
      width: 1587,
      height: 2244
    }
  },
  nodes,
  edges
};

// Write campus_graph.json to root and src/data and public
fs.writeFileSync('./campus_graph.json', JSON.stringify(campusGraph, null, 2));
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/campus_graph.json', JSON.stringify(campusGraph, null, 2));
fs.mkdirSync('./public', { recursive: true });
fs.writeFileSync('./public/campus_graph.json', JSON.stringify(campusGraph, null, 2));

console.log(`Successfully generated verified campus_graph.json for Apex Block:`);
console.log(`- Nodes count: ${Object.keys(nodes).length}`);
console.log(`- Edges count: ${edges.length}`);
console.log(`- Floors: ${Object.keys(campusGraph.floors).join(', ')}`);
