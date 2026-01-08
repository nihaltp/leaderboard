const { useState, useRef, useEffect } = React;
const { jsPDF } = window.jspdf;

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const TrophyIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2h-4a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4Z"/></svg>
);

// --- Main App Component ---
const App = () => {
    const [data, setData] = useState(null);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [linkInput, setLinkInput] = useState('');
    const boardRef = useRef(null);

    // --- Helper: Process CSV Data ---
    const processCSV = (results) => {
        try {
            const rawData = results.data;
            if (!rawData || rawData.length < 2) {
                throw new Error("Spreadsheet appears to be empty or missing header/rows.");
            }

            // Row 0: Dates
            const headerRow = rawData[0];
            // Filter valid date headers (exclude empty cells)
            const dateHeaders = headerRow.slice(1).filter(d => d && d.trim().length > 0);
            
            const participants = [];

            // Start from Row 1 (actual data)
            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];
                const name = row[0];
                
                // Skip empty rows or rows without names
                if (!name || !name.trim()) continue;

                let score = 0;
                
                // Iterate ONLY through columns corresponding to valid date headers
                // This prevents counting marks in empty 'trailing' columns
                for (let j = 1; j <= dateHeaders.length; j++) {
                    const cellValue = row[j] ? row[j].trim() : '';
                    if (cellValue.includes('✅')) score++;
                }

                participants.push({
                    id: i,
                    name: name.trim(),
                    score
                });
            }

            // Sort by score (descending)
            participants.sort((a, b) => b.score - a.score);

            setDates(dateHeaders);
            setData(participants);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to process data. Ensure the format matches: Column 1 = Names, Row 1 = Dates, Cells = ✅");
            setLoading(false);
        }
    };

    // --- Handler: File Upload ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setLoading(true);
        setError('');
        
        Papa.parse(file, {
            complete: processCSV,
            error: (err) => {
                setError("Error parsing CSV file: " + err.message);
                setLoading(false);
            },
            header: false
        });
    };

    // --- Handler: Link Fetch ---
    const handleLinkSubmit = async () => {
        if (!linkInput) return;
        setLoading(true);
        setError('');

        let fetchUrl = linkInput;
        if (linkInput.includes('docs.google.com/spreadsheets') && !linkInput.includes('output=csv')) {
            setError("Please ensure you use the 'Published to Web' -> 'CSV' link format.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const csvText = await response.text();
            
            Papa.parse(csvText, {
                complete: processCSV,
                error: (err) => {
                    setError("Error parsing CSV data.");
                    setLoading(false);
                },
                header: false
            });
        } catch (err) {
            setError("Could not fetch the link. Likely a CORS issue or Private Sheet. Use 'File > Share > Publish to Web' and select 'CSV'.");
            setLoading(false);
        }
    };

    // --- Handler: Download Image ---
    const handleDownloadImage = async () => {
        if (!boardRef.current) return;
        
        const canvas = await html2canvas(boardRef.current, {
            backgroundColor: "#ffffff",
            scale: 2
        });
        
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `leaderboard-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    };

    // --- Handler: Download PDF ---
    const handleDownloadPDF = async () => {
        if (!boardRef.current) return;
        
        setLoading(true);
        
        try {
            // Generate canvas
            const canvas = await html2canvas(boardRef.current, {
                scale: 2,
                backgroundColor: "#ffffff"
            });
            const imgData = canvas.toDataURL('image/png');

            // Initialize PDF (A4 size)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculate dimensions to fit A4 width
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`leaderboard-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            setError("Failed to generate PDF");
        }
        
        setLoading(false);
    };

    // --- Helper: Medal Colors ---
    const getRankStyle = (index) => {
        if (index === 0) return "bg-yellow-100 border-yellow-300 text-yellow-800";
        if (index === 1) return "bg-slate-200 border-slate-300 text-slate-800";
        if (index === 2) return "bg-orange-100 border-orange-300 text-orange-800";
        return "bg-white border-slate-100 text-slate-600";
    };
    
    const getMedalIcon = (index) => {
        if (index === 0) return <TrophyIcon className="text-yellow-500 w-6 h-6" />;
        if (index === 1) return <TrophyIcon className="text-slate-400 w-5 h-5" />;
        if (index === 2) return <TrophyIcon className="text-orange-400 w-5 h-5" />;
        return <span className="font-bold text-slate-400 w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Leaderboard Creator</h1>
                <p className="text-slate-500">Turn your Google Sheets into visual leaderboards instantly.</p>
            </div>

            {/* Input Section */}
            {!data && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* File Upload */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors cursor-pointer relative group">
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleFileUpload} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
                            <UploadIcon />
                        </div>
                        <h3 className="font-semibold text-lg">Upload CSV</h3>
                        <p className="text-sm text-slate-400 mt-2">Export your sheet as .csv and drop it here</p>
                    </div>

                    {/* Link Input */}
                    <div className="glass-panel p-8 rounded-2xl flex flex-col justify-center space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
                                <LinkIcon />
                            </div>
                            <h3 className="font-semibold text-lg">Google Sheet Link</h3>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Paste Published CSV link..." 
                            value={linkInput}
                            onChange={(e) => setLinkInput(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <button 
                            onClick={handleLinkSubmit}
                            disabled={!linkInput}
                            className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                            Fetch Leaderboard
                        </button>
                        <p className="text-xs text-slate-400">
                            *Must use <strong>File > Share > Publish to Web > CSV</strong>
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Processing...</p>
                </div>
            )}

            {/* Leaderboard Visualization */}
            {data && (
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                        <button 
                            onClick={() => setData(null)}
                            className="text-sm text-slate-500 hover:text-slate-900 font-medium px-4 py-2"
                        >
                            ← Start Over
                        </button>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={handleDownloadImage}
                                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                            >
                                <DownloadIcon /> Save Image
                            </button>
                            <button 
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                <FileIcon /> Save PDF
                            </button>
                        </div>
                    </div>

                    {/* The Actual Board to Screenshot */}
                    <div ref={boardRef} className="glass-panel p-8 rounded-3xl space-y-6 min-h-[600px] flex flex-col">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-slate-800">🏆 Event Leaderboard</h2>
                            <p className="text-slate-400 text-sm mt-1">{new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="flex-1 space-y-3">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-5">Participant</div>
                                <div className="col-span-2 text-center">Score</div>
                                <div className="col-span-4 text-right">Progress</div>
                            </div>

                            {/* Rows */}
                            {data.map((user, index) => {
                                // Calculate percent based on maximum possible score (total dates)
                                const percent = dates.length > 0 ? Math.round((user.score / dates.length) * 100) : 0;
                                return (
                                    <div 
                                        key={user.id} 
                                        className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl border transition-transform ${getRankStyle(index)}`}
                                    >
                                        <div className="col-span-1 flex justify-center">
                                            {getMedalIcon(index)}
                                        </div>
                                        <div className="col-span-5 font-bold truncate">
                                            {user.name}
                                        </div>
                                        <div className="col-span-2 text-center font-mono font-bold text-lg">
                                            {user.score}
                                        </div>
                                        <div className="col-span-4 flex flex-col justify-end gap-1">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-xs font-medium opacity-60 ml-auto">{percent}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-200/50 rounded-full w-full overflow-hidden relative">
                                                 <div
                                                    className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                 ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="text-center pt-8 border-t border-slate-100 text-slate-400 text-xs">
                            Generated with Leaderboard Creator
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
