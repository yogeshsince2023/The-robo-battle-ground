import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with demo data...");

  // ---------- Admin user ----------
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Default Admin",
      email: adminEmail,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Admin user ready: ${adminEmail} / ${adminPassword} (CHANGE THIS PASSWORD)`);

  // ---------- Partners (exactly 4 slots, names are placeholders) ----------
  for (let i = 1; i <= 4; i++) {
    await prisma.partner.upsert({
      where: { slotLabel: `Partner ${i}` },
      update: {},
      create: { name: `Partner ${i}`, slotLabel: `Partner ${i}` },
    });
  }
  console.log("4 partner slots ready (rename them in Admin -> Accounts -> Partners).");

  // ---------- Training courses ----------
  const courses = [
    {
      name: "Robotics Fundamentals",
      slug: "robotics-fundamentals",
      shortDescription: "A hands-on introduction to robotics: mechanisms, sensors, and control.",
      detailedDescription:
        "[DEMO] Covers robot kinematics basics, sensor integration, actuators, and building a working robot from scratch.",
      duration: "6 weeks",
      mode: "Offline",
      fees: "[SET FEES]",
      eligibility: "Class 9+ / Engineering students",
      skillsCovered: "Mechanical design, Sensors, Basic control logic",
      modules: JSON.stringify(["Introduction to Robotics", "Sensors & Actuators", "Control Basics", "Capstone Build"]),
    },
    {
      name: "Arduino Programming",
      slug: "arduino-programming",
      shortDescription: "Learn embedded programming with Arduino from scratch.",
      detailedDescription: "[DEMO] Arduino IDE, digital/analog I/O, interfacing sensors and motors, mini projects.",
      duration: "4 weeks",
      mode: "Hybrid",
      fees: "[SET FEES]",
      eligibility: "No prior experience required",
      skillsCovered: "C/C++ basics, Embedded programming, Circuit interfacing",
      modules: JSON.stringify(["Arduino Basics", "Digital & Analog I/O", "Sensor Interfacing", "Mini Project"]),
    },
    {
      name: "ESP32 & IoT",
      slug: "esp32-iot",
      shortDescription: "Build connected devices using ESP32 and IoT protocols.",
      detailedDescription: "[DEMO] Wi-Fi/BLE on ESP32, MQTT, cloud dashboards, and a capstone IoT project.",
      duration: "5 weeks",
      mode: "Online",
      fees: "[SET FEES]",
      eligibility: "Basic Arduino/C knowledge recommended",
      skillsCovered: "ESP32, Wi-Fi/BLE, MQTT, Cloud dashboards",
      modules: JSON.stringify(["ESP32 Basics", "Wi-Fi & BLE", "MQTT & Cloud", "IoT Capstone"]),
    },
    {
      name: "Embedded Systems",
      slug: "embedded-systems",
      shortDescription: "Microcontroller-based embedded systems design.",
      detailedDescription: "[DEMO] Microcontroller architecture, peripherals, RTOS basics, and debugging techniques.",
      duration: "8 weeks",
      mode: "Offline",
      fees: "[SET FEES]",
      eligibility: "Engineering students (ECE/EEE/CSE)",
      skillsCovered: "Microcontrollers, Peripherals, RTOS basics",
      modules: JSON.stringify(["Architecture", "Peripherals", "RTOS Basics", "Debugging"]),
    },
    {
      name: "PLC & Industrial Automation",
      slug: "plc-industrial-automation",
      shortDescription: "Programmable Logic Controllers for industrial automation.",
      detailedDescription: "[DEMO] Ladder logic, PLC programming, SCADA basics, and industrial safety.",
      duration: "6 weeks",
      mode: "Offline",
      fees: "[SET FEES]",
      eligibility: "Diploma/Engineering in relevant streams",
      skillsCovered: "Ladder logic, PLC programming, SCADA basics",
      modules: JSON.stringify(["PLC Basics", "Ladder Logic", "SCADA Overview", "Industrial Safety"]),
    },
    {
      name: "Robotics Competition Training",
      slug: "robotics-competition-training",
      shortDescription: "Specialized training for Robowar and robotics competitions.",
      detailedDescription: "[DEMO] Combat robot design, drivetrain selection, weapon systems, and competition strategy.",
      duration: "4 weeks",
      mode: "Offline",
      fees: "[SET FEES]",
      eligibility: "Teams preparing for competitions",
      skillsCovered: "Combat robot design, Drivetrains, Weapon systems, Strategy",
      modules: JSON.stringify(["Robot Design", "Drivetrain Selection", "Weapon Systems", "Strategy & Testing"]),
    },
    {
      name: "Autonomous Drone Building",
      slug: "autonomous-drone-building",
      shortDescription: "Design, build and program autonomous drones from scratch.",
      detailedDescription:
        "[DEMO] Frame assembly, flight controllers, ESCs and motors, telemetry, and autonomous flight modes using flight-controller firmware and companion computers.",
      duration: "6 weeks",
      mode: "Offline",
      fees: "[SET FEES]",
      eligibility: "Engineering students / robotics enthusiasts",
      skillsCovered: "Drone assembly, Flight controllers, Telemetry, Autonomous navigation",
      modules: JSON.stringify(["Drone Assembly", "Flight Controller Setup", "Telemetry & Control", "Autonomous Flight Modes"]),
    },
    {
      name: "Full Stack Web Development",
      slug: "full-stack-web-development",
      shortDescription: "Build and deploy complete web applications, front to back.",
      detailedDescription:
        "[DEMO] Modern frontend development, backend APIs, databases, authentication, and deployment — building real, working projects throughout.",
      duration: "8 weeks",
      mode: "Hybrid",
      fees: "[SET FEES]",
      eligibility: "No prior experience required",
      skillsCovered: "HTML/CSS/JavaScript, Frontend frameworks, Backend APIs, Databases, Deployment",
      modules: JSON.stringify(["Frontend Development", "Backend & APIs", "Databases", "Authentication & Deployment"]),
    },
  ];

  for (const [i, c] of courses.entries()) {
    await prisma.trainingCourse.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, certificateAvailable: true, status: "Active", displayOrder: i },
    });
  }
  console.log(`${courses.length} demo training courses seeded.`);

  // ---------- Machining services ----------
  const services = [
    {
      category: "CNC",
      title: "CNC Machining",
      description:
        "[DEMO] Precision CNC milling and turning for prototypes, functional parts, and small-batch production.",
      materials: "Aluminium, Mild Steel, Stainless Steel, Brass, Engineering Plastics",
      applications: "Robotics chassis, brackets, custom fixtures, functional prototypes",
      capabilities: "[Update exact tolerances/capabilities from Admin]",
    },
    {
      category: "VMC",
      title: "VMC Machining",
      description: "[DEMO] Vertical Machining Center services for complex, high-precision components.",
      materials: "Aluminium, Steel, Alloys",
      applications: "Multi-axis parts, precision robotics components, competition robot parts",
      capabilities: "[Update exact tolerances/capabilities from Admin]",
    },
    {
      category: "3D_PRINTING",
      title: "3D Printing",
      description: "[DEMO] FDM/resin 3D printing for rapid prototyping and lightweight components.",
      materials: "PLA, ABS, PETG, Nylon, Resin",
      applications: "Rapid prototypes, enclosures, lightweight robot parts, jigs & fixtures",
      capabilities: "[Update exact build volume/layer resolution from Admin]",
    },
  ];
  for (const [i, s] of services.entries()) {
    const exists = await prisma.machiningService.findFirst({ where: { category: s.category } });
    if (!exists) {
      await prisma.machiningService.create({ data: { ...s, displayOrder: i, status: "Active" } });
    }
  }
  console.log("Demo machining services seeded.");

  // ---------- Projects ----------
  const projects = [
    {
      name: "8kg Combat Robot — Titan",
      slug: "8kg-combat-robot-titan",
      category: "Robowar",
      coverImageUrl: "/arena/arena-1.jpg",
      shortDescription: "A competition-grade horizontal spinner combat robot engineered for the 8kg category.",
      detailedDescription:
        "Designed and fabricated in-house with custom CNC-milled chassis components, a high-torque brushless drivetrain, and impact-hardened steel armor. Tested extensively inside our 16ft combat arena under tournament conditions.",
      year: "2025",
      technologies: "CNC Machining, Brushless Motors, Custom Armor",
      clientOrEvent: "Collegiate Robowar Championship",
    },
    {
      name: "Line-Following Autonomous Bot",
      slug: "line-following-autonomous-bot",
      category: "Robotics",
      coverImageUrl: "/arena/arena-3.jpg",
      shortDescription: "High-speed autonomous navigation robot engineered for competition precision and student training capstones.",
      detailedDescription:
        "Built with high-accuracy infrared sensor arrays, custom microcontroller logic, and closed-loop PID motion control for smooth line-following at competition speeds. Developed as part of our hands-on engineering training curriculum.",
      year: "2025",
      technologies: "Arduino, PID Control, IR Sensors",
      clientOrEvent: "Robotics Training Capstone",
    },
    {
      name: "Automated Sorting Conveyor",
      slug: "automated-sorting-conveyor",
      category: "Automation",
      coverImageUrl: "/arena/arena-4.jpg",
      shortDescription: "Industrial-grade sensor-driven automated sorting conveyor fabricated with precision CNC components.",
      detailedDescription:
        "Delivered a compact sorting conveyor using PLC ladder logic and inductive sensors for automated item classification and routing.",
      year: "2024",
      technologies: "PLC, Inductive Sensors, Conveyor Mechanics",
      clientOrEvent: "Industrial Automation Client",
    },
  ];
  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        coverImageUrl: p.coverImageUrl,
        shortDescription: p.shortDescription,
        detailedDescription: p.detailedDescription,
        clientOrEvent: p.clientOrEvent,
      },
      create: { ...p, status: "Published" },
    });
  }
  console.log(`${projects.length} demo projects seeded.`);

  // ---------- Arena Photos ----------
  const arenaPhotosCount = await prisma.arenaPhoto.count();
  if (arenaPhotosCount === 0) {
    await prisma.arenaPhoto.createMany({
      data: [
        { url: "/arena/arena-1.jpg", caption: "Robowar Arena - Main Stage", displayOrder: 0 },
        { url: "/arena/arena-2.jpg", caption: "Robowar Arena - Combat Enclosure", displayOrder: 1 },
        { url: "/arena/arena-3.jpg", caption: "Robowar Arena - Testing & Pit Area", displayOrder: 2 },
        { url: "/arena/arena-4.jpg", caption: "Robowar Arena - High-Strength Polycarbonate", displayOrder: 3 },
      ],
    });
    console.log("Default arena photos seeded.");
  }

  // ---------- Certificates ----------
  await prisma.certificate.upsert({
    where: { certificateId: "RB-TRAIN-2026-00125" },
    update: {},
    create: {
      certificateId: "RB-TRAIN-2026-00125",
      studentName: "[DEMO] Demo Student",
      courseName: "Robotics Fundamentals",
      trainingDuration: "6 weeks",
      issueDate: new Date("2026-01-15"),
      completionDate: new Date("2026-01-10"),
      status: "VALID",
    },
  });
  console.log("Demo certificate seeded: RB-TRAIN-2026-00125 (try it on the verification page).");

  // ---------- FAQs ----------
  const faqs = [
    { category: "Arena", question: "Can we rent the arena for a private event?", answer: "[DEMO] Yes — submit an Arena Enquiry with your event details and we'll confirm availability." },
    { category: "Arena", question: "What robot weight categories are supported?", answer: "[DEMO] The arena supports multiple weight classes; specify your category in the enquiry form." },
    { category: "Training", question: "Do I get a certificate after training?", answer: "[DEMO] Yes, most courses include a certificate, verifiable on our Certificate Verification page." },
    { category: "Machining", question: "What file formats can I upload for a quotation?", answer: "STEP, STP, IGES, IGS, STL, OBJ, DXF, DWG, PDF, and ZIP files up to 25MB each." },
  ];
  for (const [i, f] of faqs.entries()) {
    const exists = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!exists) {
      await prisma.faq.create({ data: { ...f, displayOrder: i } });
    }
  }
  console.log(`${faqs.length} demo FAQs seeded.`);

  // ---------- Demo enquiries (a couple, clearly marked) ----------
  await prisma.contactMessage.create({
    data: {
      referenceNo: "CONTACT-2026-DEMO1",
      name: "[DEMO] Sample Visitor",
      email: "demo.visitor@example.com",
      phone: "0000000000",
      subject: "General enquiry (demo record)",
      message: "[DEMO DATA] This is a sample contact message so you can see the admin dashboard populated. Safe to delete.",
      status: "NEW",
    },
  }).catch(() => {});

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
