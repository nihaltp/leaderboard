const { useState, useRef, useEffect, useMemo } = React;
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

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

// --- CONSTANTS ---
const MODES = {
    POINTS: { id: 'points', label: 'Total Points', icon: '⚡', desc: 'Every check counts' },
    CONSISTENCY: { id: 'consistency', label: 'Consistency', icon: '📅', desc: 'Days completed' },
    STREAK: { id: 'streak', label: 'Current Streak', icon: '🔥', desc: 'Consecutive days' }
};

// --- Main App Component ---
const App = () => {
    // State
    const [rawData, setRawData] = useState(null); // Unsorted participants
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [linkInput, setLinkInput] = useState('');
    
    // View Config
    const [viewMode, setViewMode] = useState('leaderboard'); // 'leaderboard' | 'table'
    const [rankType, setRankType] = useState('dense'); // 'dense' | 'competition'
    const [scoringMode, setScoringMode] = useState('points'); // 'points' | 'consistency' | 'streak'
    const [title, setTitle] = useState('Event Leaderboard');
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const boardRef = useRef(null);

    // --- Helper: Process CSV Data ---
    const processCSV = (results) => {
        try {
            const raw = results.data;
            if (!raw || raw.length < 2) throw new Error("Empty sheet");

            // Row 0: Dates
            const headerRow = raw[0];
            const dateHeaders = headerRow.slice(1).filter(d => d && d.trim().length > 0);
            
            const participants = [];

            // Start from Row 1 (actual data)
            for (let i = 1; i < raw.length; i++) {
                const row = raw[i];
                const name = row[0];
                
                // Skip empty rows or rows without names
                if (!name || !name.trim()) continue;

                let points = 0;
                let consistency = 0;
                const history = []; // Capture the raw data per day

                for (let j = 1; j <= dateHeaders.length; j++) {
                    const cellValue = row[j] ? row[j].trim() : '';
                    const count = [...cellValue].filter(ch => ch === '✅').length;
                    
                    if (count > 0) {
                        points += count;   // Mode 1: All checks
                        consistency += 1;  // Mode 2: Days active
                    }
                    history.push(count);
                }

                // Calculate Streak (Mode 3: Consecutive days)
                let streak = 0;
                for (let k = history.length - 1; k >= 0; k--) {
                    if (history[k] > 0) streak++;
                    else break;
                }

                participants.push({
                    id: i,
                    name: name.trim(),
                    stats: {
                        points,
                        consistency,
                        streak
                    },
                    history
                });
            }

            setDates(dateHeaders);
            setRawData(participants);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to parse data. Ensure 1st row = Dates, 1st Col = Names.");
            setLoading(false);
        }
    };

    // --- SORTED DATA (MEMOIZED) ---
    const sortedData = useMemo(() => {
        if (!rawData) return [];
        
        // clone and sort
        const sorted = [...rawData].sort((a, b) => {
            const valA = a.stats[scoringMode];
            const valB = b.stats[scoringMode];
            
            // Primary sort: selected mode
            if (valB !== valA) return valB - valA;
            
            // Tie-breakers
            if (scoringMode === 'streak') return b.stats.points - a.stats.points;
            if (scoringMode === 'consistency') return b.stats.points - a.stats.points;
            return b.stats.consistency - a.stats.consistency;
        });

        return sorted;
    }, [rawData, scoringMode]);

    // --- HANDLERS ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setLoading(true);
        Papa.parse(file, {
            complete: processCSV,
            error: (err) => { setError(err.message); setLoading(false); },
            header: false
        });
    };

    const handleLink = async (url) => {
        setLoading(true);
        setError('');
        
        // Clean URL
        let fetchUrl = url;
        if (!url.includes('output=csv')) {
            if (url.includes('/edit')) fetchUrl = url.replace(/\/edit.*$/, '/pub?output=csv');
            else fetchUrl = url + '/pub?output=csv';
        }
        updateUrlParams({ link: fetchUrl });

        try {
            const res = await fetch(fetchUrl);
            if (!res.ok) throw new Error("Network error");
            const txt = await res.text();
            Papa.parse(txt, {
                complete: processCSV,
                error: () => { setError("CSV Parse Error"); setLoading(false); },
                header: false
            });
        } catch (e) {
            setError("Could not fetch sheet. Ensure it is 'Published to Web' as CSV.");
            setLoading(false);
        }
    };

    // --- URL SYNC ---
    const updateUrlParams = (newParams = {}) => {
        const url = new URL(window.location);
        const current = Object.fromEntries(url.searchParams);
        const merged = { ...current, ...newParams };
        
        url.search = '';
        if (merged.rank) url.searchParams.set('rank', merged.rank);
        if (merged.view) url.searchParams.set('view', merged.view);
        if (merged.mode) url.searchParams.set('mode', merged.mode);
        if (merged.title) url.searchParams.set('title', merged.title);
        if (merged.link) url.searchParams.set('link', merged.link);
        
        window.history.pushState({}, '', url);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("title")) setTitle(decodeURIComponent(params.get("title")));
        if (params.get("mode") && MODES[params.get("mode").toUpperCase()]) setScoringMode(params.get("mode"));
        if (params.get("view")) setViewMode(params.get("view"));
        
        const link = params.get("link");
        if (link) {
            setLinkInput(link);
            handleLink(link);
        }
    }, []);

    useEffect(() => {
        if(rawData) updateUrlParams({ mode: scoringMode, view: viewMode, title: encodeURIComponent(title) });
    }, [scoringMode, viewMode, title, rawData]);


    // --- HELPERS ---
    const handleDownloadPDF = async () => {
        window.print();
    };

    const getRank = (user, index, allData) => {
        const score = user.stats[scoringMode];
        if (rankType === 'dense') {
            const unique = [...new Set(allData.map(u => u.stats[scoringMode]))];
            return unique.indexOf(score);
        }
        return index;
    };
    
    const getMedalIcon = (index) => {
        if (index === 0) return <TrophyIcon className="text-yellow-500 w-6 h-6" />;
        if (index === 1) return <TrophyIcon className="text-slate-400 w-5 h-5" />;
        if (index === 2) return <TrophyIcon className="text-orange-400 w-5 h-5" />;
        return <span className="font-bold text-slate-400 w-6 text-center">{index + 1}</span>;
    };

    const getRankStyle = (index) => {
        if (index === 0) return "bg-yellow-50 border-yellow-200 text-yellow-900";
        if (index === 1) return "bg-slate-50 border-slate-200 text-slate-900";
        if (index === 2) return "bg-orange-50 border-orange-200 text-orange-900";
        return "bg-white border-slate-100 text-slate-600";
    };

    // --- Progress Bar Color ---
    const getBarColor = (rank) => {
        if (rank === 0) return "bg-yellow-400"; // Gold
        if (rank === 1) return "bg-slate-400";  // Silver
        if (rank === 2) return "bg-orange-400"; // Bronze
        return "bg-emerald-500";                // Everyone else: Green
    };

    const handleDownloadImage = async () => {
        if (!boardRef.current) return;
        setLoading(true);
        try {
            const canvas = await html2canvas(boardRef.current, {
                backgroundColor: "#ffffff",
                scale: 2,
                windowWidth: 2000,
                onclone: (doc) => {
                    const els = doc.querySelectorAll('.overflow-x-auto');
                    els.forEach(el => { el.style.overflow = 'visible'; el.style.width = 'auto'; });
                }
            });
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = `${title}_${scoringMode}.png`;
            link.click();
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // --- RENDER ---
    const isTable = viewMode === 'table';
    const containerClass = isTable ? "max-w-7xl" : "max-w-4xl";

    return (
        <div className={`${containerClass} mx-auto p-6 space-y-8 pb-20`}>
            {/* --- HEADER / LANDING --- */}
            {!rawData && (
                <div className="text-center space-y-8 mt-10">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Leaderboard Creator</h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Visualize your Google Sheets data instantly. No login required.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                         {/* UPLOAD */}
                        <div className="glass-panel p-8 rounded-2xl hover:border-blue-400 transition-all cursor-pointer relative group flex flex-col items-center justify-center text-center">
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="bg-blue-50 p-4 rounded-full mb-4 text-blue-600 group-hover:scale-110 transition-transform"><UploadIcon /></div>
                            <h3 className="font-bold text-xl mb-2">Upload CSV</h3>
                            <p className="text-sm text-slate-400">Drag & drop your exported file</p>
                        </div>

                         {/* LINK */}
                        <div className="glass-panel p-8 rounded-2xl flex flex-col justify-center space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-emerald-50 p-2 rounded-full text-emerald-600"><LinkIcon /></div>
                                <h3 className="font-bold text-xl">Paste Link</h3>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="https://docs.google.com/..." 
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    className="flex-1 p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button onClick={() => handleLink(linkInput)} disabled={!linkInput} className="bg-slate-900 text-white px-6 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50">Go</button>
                            </div>
                            <p className="text-xs text-slate-400">*File &gt; Share &gt; Publish to Web &gt; CSV</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ERROR --- */}
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center justify-center gap-2"><span>⚠️</span> {error}</div>}
            
            {/* --- LOADING --- */}
            {loading && <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div><p className="text-slate-400 animate-pulse">Crunching numbers...</p></div>}

            {/* --- DASHBOARD --- */}
            {rawData && !loading && (
                <div className="space-y-6">
                    {/* CONTROLS */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
                            <button onClick={() => {setRawData(null); updateUrlParams({link:null});}} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">← Back</button>
                            <div className="w-px h-8 bg-slate-100 mx-2"></div>
                            
                            {/* Mode Selectors */}
                            {Object.values(MODES).map(m => (
                                <button 
                                    key={m.id}
                                    onClick={() => setScoringMode(m.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${scoringMode === m.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <span>{m.icon}</span> {m.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Export Buttons */}
                        <div className="flex gap-2">
                                <button onClick={() => setViewMode(viewMode === 'leaderboard' ? 'table' : 'leaderboard')} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg" title="Toggle View"><ListIcon /></button>
                                
                                {/* PDF Button */}
                                <button 
                                    onClick={handleDownloadPDF} 
                                    className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                                >
                                    <FileIcon /> PDF
                                </button>

                                {/* PNG Button */}
                                <button 
                                    onClick={handleDownloadImage} 
                                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                                >
                                    <DownloadIcon /> PNG
                                </button>
                        </div>
                    </div>

                    {/* MAIN BOARD */}
                    <div ref={boardRef} className="glass-panel p-10 rounded-3xl min-h-[600px] bg-white relative">
                        {/* Title */}
                        <div className="text-center mb-10">
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    className="text-4xl font-black text-center text-slate-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full max-w-lg mx-auto"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => setIsEditingTitle(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                                />
                            ) : (
                                <h1 onDoubleClick={() => setIsEditingTitle(true)} className="text-4xl font-black text-slate-900 cursor-pointer hover:opacity-70 transition-opacity select-none">{title}</h1>
                            )}
                            <div className="flex justify-center items-center gap-2 mt-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
                                <span>{MODES[scoringMode.toUpperCase()].icon} Ranked by {MODES[scoringMode.toUpperCase()].label}</span>
                                <span>•</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* --- VIEW: CARDS --- */}
                        {viewMode === 'leaderboard' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-slate-300 uppercase tracking-widest">
                                    <div className="col-span-1 text-center">#</div>
                                    <div className="col-span-5">Participant</div>
                                    <div className="col-span-2 text-center">{scoringMode === 'points' ? 'XP' : scoringMode === 'streak' ? 'Streak' : 'Days'}</div>
                                    <div className="col-span-4 text-right">Activity</div>
                                </div>

                                {sortedData.map((user, idx) => {
                                    const rank = getRank(user, idx, sortedData);
                                    
                                    // Progress Bar Logic
                                    const maxScore = Math.max(...sortedData.map(u => u.stats[scoringMode]), 1);
                                    const totalDays = dates.length || 1;
                                    
                                    let percent = 0;
                                    let displayScore = user.stats[scoringMode];
                                    let suffix = '';

                                    if (scoringMode === 'points') {
                                        percent = (user.stats.points / maxScore) * 100;
                                    } else if (scoringMode === 'consistency') {
                                        percent = (user.stats.consistency / totalDays) * 100;
                                        suffix = ` / ${totalDays}`;
                                    } else if (scoringMode === 'streak') {
                                        percent = (user.stats.streak / totalDays) * 100;
                                        suffix = ' days';
                                    }

                                    return (
                                        <div key={user.id} className={`grid grid-cols-12 gap-4 items-center p-5 rounded-2xl border-2 transition-all ${getRankStyle(rank)}`}>
                                            <div className="col-span-1 flex justify-center scale-110">{getMedalIcon(rank)}</div>
                                            <div className="col-span-5 font-bold text-lg truncate">{user.name}</div>
                                            <div className="col-span-2 text-center font-mono font-bold text-xl">
                                                {displayScore}<span className="text-xs opacity-50 ml-1 font-sans font-normal">{suffix}</span>
                                            </div>
                                            <div className="col-span-4">
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    {/* Updated Progress Bar Color Logic Here */}
                                                    <div className={`h-full rounded-full ${getBarColor(rank)}`} style={{width: `${percent}%`}}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* --- VIEW: TABLE --- */}
                        {viewMode === 'table' && (
                            <div className="overflow-x-auto custom-scroll pb-4">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                                            <th className="px-4 py-4 text-center">#</th>
                                            <th className="px-4 py-4 border-r border-slate-100 sticky left-0 bg-white z-10">Name</th>
                                            <th className="px-4 py-4 text-center bg-slate-50 text-slate-900 font-bold border-r border-slate-200">
                                                {scoringMode === 'points' ? 'XP' : scoringMode === 'streak' ? 'Streak' : 'Days'}
                                            </th>
                                            {dates.map((d, i) => <th key={i} className="px-2 py-4 text-center min-w-[60px] font-medium">{d}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedData.map((user, idx) => (
                                            <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-700 border-r border-slate-100 sticky left-0 bg-white z-10">{user.name}</td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-900 bg-slate-50 border-r border-slate-200">{user.stats[scoringMode]}</td>
                                                {user.history.map((count, i) => (
                                                    <td key={i} className="px-2 py-3 text-center whitespace-nowrap">
                                                        {count > 0 
                                                            ? (count > 1 ? <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">{count}</span> : '✅') 
                                                            : <span className="text-slate-200">·</span>
                                                        }
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="text-center text-slate-300 text-sm">
                <a href="https://github.com/nihaltp/leaderboard" className="hover:text-slate-500">Made</a> with ❤️ by <a href="https://github.com/nihaltp" className="hover:text-slate-500">nihaltp</a>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
