
const Downloads = () => {
  const files = [
    {
      title: 'Student Data',
      description: 'Download the student data in Excel format.',
      fileUrl: '/forms/students.xlsx', // Replace with actual file path
    },
    {
      title: 'Teacher Data',
      description: 'Download the teacher data in Excel format.',
      fileUrl: '/forms/teachers.xlsx', // Replace with actual file path
    },
    {
      title: 'Subject Data',
      description: 'Download the subject data in Excel format.',
      fileUrl: '/forms/subjects.xlsx', // Replace with actual file path
    },
  ];

  return (
    <div className="container mx-auto p-4 mt-10">
      <h1 className="text-3xl font-bold text-teal-700 mb-6">Downloads</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {files.map((file, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105"
          >
            <h2 className="text-xl font-semibold text-teal-600 mb-2">{file.title}</h2>
            <p className="text-gray-600 mb-4">{file.description}</p>
            <a
              href={file.fileUrl}
              download
              className="bg-teal-600 text-white rounded hover:bg-teal-700 transition px-4 py-2"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Downloads;
