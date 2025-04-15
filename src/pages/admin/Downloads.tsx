import { FileDown } from 'lucide-react';

const Downloads = () => {
  const files = [
    {
      title: 'Student Data',
      description: 'Download the student data in Excel format.',
      fileUrl: '/forms/students.xlsx',
    },
    {
      title: 'Teacher Data',
      description: 'Download the teacher data in Excel format.',
      fileUrl: '/forms/teachers.xlsx',
    },
    {
      title: 'Subject Data',
      description: 'Download the subject data in Excel format.',
      fileUrl: '/forms/subjects.xlsx',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-teal-50 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-700 mb-10 text-center">📥 Downloads</h1>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-[1.03] flex flex-col items-center text-center"
            >
              <div className="text-teal-600 mb-4">
                <FileDown className="w-12 h-12" strokeWidth={1.5} />
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-2">{file.title}</h2>
              <p className="text-sm text-gray-600 mb-6">{file.description}</p>

              <a
                href={file.fileUrl}
                download
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg transition shadow-md"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Downloads;
