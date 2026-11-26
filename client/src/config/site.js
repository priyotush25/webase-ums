// Edit this file to rebrand the whole website for a client.
const siteConfig = {
    name: "University of Management Studies",
    shortName: "UMS",
    tagline: "Learn with purpose. Graduate with confidence.",
    established: 2005,

    address: "University Road, Dhanmondi, Dhaka 1205, Bangladesh",
    phone: "+880 1234 567890",
    hotline: "16xxx",
    email: "info@university.edu",
    admissionEmail: "admission@university.edu",

    admission: {
        session: "Spring 2027",
        deadline: "15 January 2027",
        eligibility: [
            "Bachelor: minimum GPA 2.50 in both SSC and HSC (or equivalent), with a combined GPA of at least 6.00.",
            "Masters: a recognized bachelor degree with a minimum CGPA of 2.50.",
            "Applicants from the science group are eligible for Engineering programs.",
        ],
        documents: [
            "SSC and HSC (or equivalent) mark sheets and certificates",
            "Two recent passport-size photographs",
            "National ID or birth certificate",
            "Guardian's National ID copy",
        ],
    },

    milestones: [
        { year: "2005", text: "The university opens with three departments and its first 240 students." },
        { year: "2011", text: "A new academic building and central library are inaugurated." },
        { year: "2016", text: "Masters programs are introduced across all departments." },
        { year: "2021", text: "Fully digital campus: online admission, enrollment and results." },
    ],

    values: [
        { title: "Academic integrity", text: "Fair assessment, honest research and transparent records for every student." },
        { title: "Student first", text: "Small classes, approachable teachers and support from admission to graduation." },
        { title: "Industry ready", text: "Curricula reviewed with employers, with internships and project work built in." },
        { title: "Open to everyone", text: "Merit-based admission and a campus that welcomes students from every background." },
    ],
};

export default siteConfig;
