import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhoneStateSync } from './usePhoneStateSync';
import { generateProfiles, type ProfileRecord } from './profileGenerator';
import { ResultsSection, type ColumnVisibility } from './ResultsSection';
import { MapPin, Phone, Settings2, CheckCircle2, Zap, LayoutList, RefreshCcw, ChevronDown } from 'lucide-react';

const ALL_COLUMNS: (keyof ColumnVisibility)[] = [
  'rawPhone',
  'formattedPhone',
  'phoneValid',
  'firstName',
  'lastName',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'addressValid'
];

export default function App() {
  const {
    selectedState,
    selectedAreaCode,
    startingPhone,
    availableAreaCodes,
    detectedAreaState,
    isValidFormat,
    handleStateChange,
    handleAreaCodeChange,
    handlePhoneInputChange,
  } = usePhoneStateSync('CO');

  const [generationCount, setGenerationCount] = useState<number>(100);
  const [outputFileName, setOutputFileName] = useState<string>('usa_profiles.xlsx');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [records, setRecords] = useState<ProfileRecord[]>([]);

  const [visibleColumns, setVisibleColumns] = useState<ColumnVisibility>({
    rawPhone: true,
    formattedPhone: true,
    phoneValid: true,
    firstName: true,
    lastName: true,
    streetAddress: true,
    city: true,
    state: true,
    zipCode: true,
    addressValid: true,
  });

  const toggleColumn = (key: keyof ColumnVisibility) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = () => {
    setVisibleColumns(
      ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: true }), {} as ColumnVisibility)
    );
  };

  const handleReset = () => {
    setVisibleColumns(
      ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: true }), {} as ColumnVisibility)
    );
  };

  const handleGenerate = async () => {
    if (!isValidFormat) return;
    setIsGenerating(true);

    const generated = await generateProfiles({
      selectedState,
      selectedAreaCode,
      startingPhone,
      count: generationCount,
    });

    setRecords(generated);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 font-sans p-4 md:p-8 selection:bg-[#00ff9d]/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3138] pb-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 rounded-xl shadow-[0_0_15px_rgba(0,255,157,0.15)]">
                <Zap size={24} className="fill-[#00ff9d]" />
              </span>
              USA Contact Profile Generator
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-2 font-medium">
              Generate state-aligned phone leads, addresses, and export clean Excel reports.
            </p>
          </div>
        </motion.header>

        {/* Top Panel: Data Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-[#141A21] border border-[#2A3138] rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#00ff9d]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 border-b border-[#2A3138] pb-4">
            <Settings2 className="text-[#00ff9d]" size={20} />
            <h2 className="text-xl font-bold text-white tracking-wide">
              Configuration Panel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Target State */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Target State
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin size={16} className="text-slate-500" />
                </div>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-[#2A3138] rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all appearance-none shadow-inner"
                >
                  <option value="AL">AL — Alabama</option>
                  <option value="AK">AK — Alaska</option>
                  <option value="AZ">AZ — Arizona</option>
                  <option value="AR">AR — Arkansas</option>
                  <option value="CA">CA — California</option>
                  <option value="CO">CO — Colorado</option>
                  <option value="CT">CT — Connecticut</option>
                  <option value="DE">DE — Delaware</option>
                  <option value="DC">DC — District of Columbia</option>
                  <option value="FL">FL — Florida</option>
                  <option value="GA">GA — Georgia</option>
                  <option value="HI">HI — Hawaii</option>
                  <option value="ID">ID — Idaho</option>
                  <option value="IL">IL — Illinois</option>
                  <option value="IN">IN — Indiana</option>
                  <option value="IA">IA — Iowa</option>
                  <option value="KS">KS — Kansas</option>
                  <option value="KY">KY — Kentucky</option>
                  <option value="LA">LA — Louisiana</option>
                  <option value="ME">ME — Maine</option>
                  <option value="MD">MD — Maryland</option>
                  <option value="MA">MA — Massachusetts</option>
                  <option value="MI">MI — Michigan</option>
                  <option value="MN">MN — Minnesota</option>
                  <option value="MS">MS — Mississippi</option>
                  <option value="MO">MO — Missouri</option>
                  <option value="MT">MT — Montana</option>
                  <option value="NE">NE — Nebraska</option>
                  <option value="NV">NV — Nevada</option>
                  <option value="NH">NH — New Hampshire</option>
                  <option value="NJ">NJ — New Jersey</option>
                  <option value="NM">NM — New Mexico</option>
                  <option value="NY">NY — New York</option>
                  <option value="NC">NC — North Carolina</option>
                  <option value="ND">ND — North Dakota</option>
                  <option value="OH">OH — Ohio</option>
                  <option value="OK">OK — Oklahoma</option>
                  <option value="OR">OR — Oregon</option>
                  <option value="PA">PA — Pennsylvania</option>
                  <option value="RI">RI — Rhode Island</option>
                  <option value="SC">SC — South Carolina</option>
                  <option value="SD">SD — South Dakota</option>
                  <option value="TN">TN — Tennessee</option>
                  <option value="TX">TX — Texas</option>
                  <option value="UT">UT — Utah</option>
                  <option value="VT">VT — Vermont</option>
                  <option value="VA">VA — Virginia</option>
                  <option value="WA">WA — Washington</option>
                  <option value="WV">WV — West Virginia</option>
                  <option value="WI">WI — Wisconsin</option>
                  <option value="WY">WY — Wyoming</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Target Area Code */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Target Area Code
              </label>
              <div className="relative">
                <select
                  value={selectedAreaCode}
                  onChange={(e) => handleAreaCodeChange(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-[#2A3138] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all appearance-none shadow-inner"
                >
                  <option value="all">All Area Codes (Random)</option>
                  {availableAreaCodes.map((code) => (
                    <option key={code} value={code}>
                      {code} ({selectedState})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Generation Count */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Records Count
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={generationCount}
                onChange={(e) => setGenerationCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#0B0F14] border border-[#2A3138] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all shadow-inner"
              />
            </div>

            {/* Starting Phone Number */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Starting Phone Number <span className="text-slate-500 font-normal normal-case">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone size={16} className={isValidFormat ? "text-slate-500" : "text-rose-500"} />
                </div>
                <input
                  type="text"
                  value={startingPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value)}
                  placeholder="e.g. (303) 555-0100"
                  className={`w-full bg-[#0B0F14] border rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:outline-none transition-all shadow-inner ${
                    isValidFormat ? 'border-[#2A3138] focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d]' : 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400'
                  }`}
                />
              </div>
              <AnimatePresence>
                {!isValidFormat && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-rose-400 mt-1.5 font-medium"
                  >
                    Invalid phone format. Please enter a 10-digit US phone number.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Output File Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Excel File Name
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="usa_profiles.xlsx"
                className="w-full bg-[#0B0F14] border border-[#2A3138] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00ff9d] focus:ring-1 focus:ring-[#00ff9d] transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Column Toggle Checklist */}
          <div className="pt-6 border-t border-[#2A3138] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <LayoutList size={16} className="text-slate-400" />
                  Display Columns
                </h3>
                <p className="text-xs text-slate-500 mt-1">Choose which fields appear in the table and export.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-[#00ff9d] hover:text-[#00e68e] transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Select All
                </button>
                <button 
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                  <RefreshCcw size={14} /> Reset
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {ALL_COLUMNS.map((colKey, index) => {
                const isActive = visibleColumns[colKey];
                return (
                  <motion.button
                    key={colKey}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleColumn(colKey)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      isActive
                        ? 'bg-[#00ff9d] border-[#00ff9d] text-[#0B0F14] shadow-[0_0_10px_rgba(0,255,157,0.3)]'
                        : 'bg-transparent border-[#2A3138] text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {colKey}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#2A3138] mt-6">
            <div className="flex items-center gap-2 bg-[#0B0F14] px-4 py-2 rounded-lg border border-[#2A3138]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff9d] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff9d]"></span>
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Active State: <strong className="text-white ml-1">{detectedAreaState || selectedState}</strong>
              </span>
            </div>

            <motion.button
              whileHover={isValidFormat && !isGenerating ? { scale: 1.02 } : {}}
              whileTap={isValidFormat && !isGenerating ? { scale: 0.98 } : {}}
              onClick={handleGenerate}
              disabled={isGenerating || !isValidFormat}
              className="bg-[#00ff9d] hover:bg-[#00e68e] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0F14] font-extrabold px-8 py-3.5 rounded-xl transition-colors shadow-[0_0_20px_rgba(0,255,157,0.2)] hover:shadow-[0_0_25px_rgba(0,255,157,0.3)] flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0B0F14]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Zap fill="currentColor" size={18} />
                  Generate Profiles ({generationCount})
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {records.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <ResultsSection
                records={records}
                outputFileName={outputFileName}
                visibleColumns={visibleColumns}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
