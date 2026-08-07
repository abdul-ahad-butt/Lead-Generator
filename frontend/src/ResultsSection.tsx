import { useMemo, useEffect, useState } from 'react';
import type { ProfileRecord } from './profileGenerator';
import { exportProfilesToExcel } from './excelExporter';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, XCircle } from 'lucide-react';

export interface ColumnVisibility {
  rawPhone: boolean;
  formattedPhone: boolean;
  phoneValid: boolean;
  firstName: boolean;
  lastName: boolean;
  streetAddress: boolean;
  city: boolean;
  state: boolean;
  zipCode: boolean;
  addressValid: boolean;
}

interface ResultsSectionProps {
  records: ProfileRecord[];
  outputFileName?: string;
  visibleColumns?: ColumnVisibility;
}

const DEFAULT_VISIBLE_COLUMNS: ColumnVisibility = {
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
};

// Animated Number Component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600; // 600ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(easeProgress * value));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
};

export const ResultsSection = ({
  records,
  outputFileName = 'generated_profiles.xlsx',
  visibleColumns = DEFAULT_VISIBLE_COLUMNS,
}: ResultsSectionProps) => {
  const totalRecords = records.length;
  
  const validNumbersCount = useMemo(() => {
    return records.filter((r) => r.phoneValid).length;
  }, [records]);

  const validAddressesCount = useMemo(() => {
    return records.filter((r) => r.addressValid).length;
  }, [records]);

  const handleDownload = () => {
    if (records.length === 0) return;
    exportProfilesToExcel(records, {
      fileName: outputFileName,
      sheetName: 'Profiles',
    });
  };

  // Pre-calculate stagger limits to avoid massive delays on large datasets
  const MAX_STAGGER_ITEMS = 100;

  if (records.length === 0) return null;

  return (
    <div className="w-full bg-[#141A21] border border-[#2A3138] rounded-2xl p-6 md:p-8 text-white space-y-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-wide text-white">Results Overview</h2>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 bg-[#2A3138] hover:bg-[#323A44] border border-[#3E4752] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Download size={18} className="text-[#00ff9d]" />
          Download Excel
        </motion.button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#0B0F14] border border-[#2A3138] rounded-xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-slate-700"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            TOTAL RECORDS
          </span>
          <span className="text-4xl font-extrabold text-white">
            <AnimatedNumber value={totalRecords} />
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#0B0F14] border border-[#2A3138] rounded-xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-[#00ff9d]"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            VALID NUMBERS
          </span>
          <span className="text-4xl font-extrabold text-white">
            <AnimatedNumber value={validNumbersCount} />
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#0B0F14] border border-[#2A3138] rounded-xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-2 h-full bg-[#00ff9d]"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            VALID ADDRESSES
          </span>
          <span className="text-4xl font-extrabold text-white">
            <AnimatedNumber value={validAddressesCount} />
          </span>
        </motion.div>
      </div>

      {/* Results Table */}
      <div 
        className="overflow-x-auto rounded-xl border border-[#2A3138] bg-[#0B0F14] shadow-inner"
        style={{ WebkitOverflowScrolling: 'touch', willChange: 'transform' }}
      >
        <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#141A21] border-b border-[#2A3138] text-slate-400 font-semibold text-xs uppercase tracking-wider">
              {visibleColumns.rawPhone && <th className="py-4 px-5 min-w-[120px]">Phone (Raw)</th>}
              {visibleColumns.formattedPhone && <th className="py-4 px-5 min-w-[150px]">Phone (Formatted)</th>}
              {visibleColumns.phoneValid && <th className="py-4 px-5 text-center min-w-[120px]">Format Valid</th>}
              {visibleColumns.firstName && <th className="py-4 px-5 min-w-[120px]">First Name</th>}
              {visibleColumns.lastName && <th className="py-4 px-5 min-w-[120px]">Last Name</th>}
              {visibleColumns.streetAddress && <th className="py-4 px-5 min-w-[180px]">Street Address</th>}
              {visibleColumns.city && <th className="py-4 px-5 min-w-[120px]">City</th>}
              {visibleColumns.state && <th className="py-4 px-5 min-w-[80px]">State</th>}
              {visibleColumns.zipCode && <th className="py-4 px-5 min-w-[100px]">ZIP Code</th>}
              {visibleColumns.addressValid && <th className="py-4 px-5 text-center min-w-[120px]">Address Valid</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3138]/50 text-slate-300 font-medium">
            {records.map((row, idx) => {
              const delay = Math.min(idx, MAX_STAGGER_ITEMS) * 0.01; // max 1 second total stagger
              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay, duration: 0.2 }}
                  key={idx} 
                  className="hover:bg-[#141A21]/80 transition-colors"
                >
                  {visibleColumns.rawPhone && <td className="py-3 px-5 font-mono text-xs">{row.rawPhone}</td>}
                  {visibleColumns.formattedPhone && <td className="py-3 px-5 font-mono text-xs text-white">{row.formattedPhone}</td>}
                  
                  {visibleColumns.phoneValid && (
                    <td className="py-3 px-5 text-center">
                      {row.phoneValid ? (
                        <span className="inline-flex items-center justify-center bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 rounded-md px-2 py-0.5 text-[11px] uppercase font-bold tracking-wide">
                          <CheckCircle2 size={12} className="mr-1" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md px-2 py-0.5 text-[11px] uppercase font-bold tracking-wide">
                          <XCircle size={12} className="mr-1" /> Invalid
                        </span>
                      )}
                    </td>
                  )}
                  
                  {visibleColumns.firstName && <td className="py-3 px-5">{row.firstName}</td>}
                  {visibleColumns.lastName && <td className="py-3 px-5">{row.lastName}</td>}
                  {visibleColumns.streetAddress && <td className="py-3 px-5 text-slate-400">{row.streetAddress}</td>}
                  {visibleColumns.city && <td className="py-3 px-5 text-slate-400">{row.city}</td>}
                  {visibleColumns.state && <td className="py-3 px-5 text-white font-bold">{row.state}</td>}
                  {visibleColumns.zipCode && <td className="py-3 px-5 font-mono text-xs">{row.zipCode}</td>}
                  
                  {visibleColumns.addressValid && (
                    <td className="py-3 px-5 text-center">
                      {row.addressValid ? (
                        <span className="inline-flex items-center justify-center bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/20 rounded-md px-2 py-0.5 text-[11px] uppercase font-bold tracking-wide">
                          <CheckCircle2 size={12} className="mr-1" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md px-2 py-0.5 text-[11px] uppercase font-bold tracking-wide">
                          <XCircle size={12} className="mr-1" /> Invalid
                        </span>
                      )}
                    </td>
                  )}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
