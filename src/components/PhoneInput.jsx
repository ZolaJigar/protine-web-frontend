import { useState, useRef } from 'react';
import {
  Box, Typography, FormHelperText, Popover, MenuList, MenuItem,
  InputAdornment, OutlinedInput, InputLabel, FormControl,
} from '@mui/material';
import { Phone, KeyboardArrowDown } from '@mui/icons-material';

/**
 * PhoneInput — single connected field matching MUI TextField styling.
 * Uses inline SVG flags — no external CDN dependency.
 */

// Inline SVG flag components for each country
const FLAGS = {
  IN: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
      <rect width="900" height="200" y="0"   fill="#FF9933"/>
      <rect width="900" height="200" y="200" fill="#FFFFFF"/>
      <rect width="900" height="200" y="400" fill="#138808"/>
      <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="8"/>
      <circle cx="450" cy="300" r="8" fill="#000080"/>
      {Array.from({length:24},(_,i)=>{const a=i*15*Math.PI/180;return(
        <line key={i} x1={450+52*Math.cos(a)} y1={300+52*Math.sin(a)} x2={450+60*Math.cos(a)} y2={300+60*Math.sin(a)} stroke="#000080" strokeWidth="3"/>
      )})}
    </svg>
  ),
  US: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 100">
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>(
        <rect key={i} width="190" height="7.69" y={i*7.69} fill={i%2===0?"#B22234":"#FFFFFF"}/>
      ))}
      <rect width="76" height="53.8" fill="#3C3B6E"/>
      {Array.from({length:50},(_,i)=>{
        const row=Math.floor(i/6); const col=i%6;
        const x=col*12.5+(row%2===0?6:12.5); const y=row*9+5;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#FFFFFF"/>;
      })}
    </svg>
  ),
  GB: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  ),
  AE: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#FFFFFF"/>
      <rect width="300" height="66.67" y="0" fill="#00732F"/>
      <rect width="300" height="66.67" y="133.33" fill="#000000"/>
      <rect width="80" height="200" fill="#FF0000"/>
    </svg>
  ),
  SG: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 267">
      <rect width="400" height="133.5" fill="#EF3340"/>
      <rect width="400" height="133.5" y="133.5" fill="#FFFFFF"/>
      <circle cx="120" cy="110" r="50" fill="#FFFFFF"/>
      <circle cx="145" cy="110" r="50" fill="#EF3340"/>
      {[0,1,2,3,4].map(i=>{const a=(i*72-90)*Math.PI/180;return(
        <polygon key={i} points={`${80+20*Math.cos(a)},${65+20*Math.sin(a)} ${80+8*Math.cos(a+Math.PI/5)},${65+8*Math.sin(a+Math.PI/5)} ${80+8*Math.cos(a-Math.PI/5)},${65+8*Math.sin(a-Math.PI/5)}`} fill="#FFFFFF"/>
      )})}
    </svg>
  ),
  AU: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640">
      <rect width="1280" height="640" fill="#00008B"/>
      <path d="M0,0 L480,240 M480,0 L0,240" stroke="#FFFFFF" strokeWidth="80"/>
      <path d="M0,0 L480,240 M480,0 L0,240" stroke="#CC0001" strokeWidth="48"/>
      <path d="M240,0 V240 M0,120 H480" stroke="#FFFFFF" strokeWidth="120"/>
      <path d="M240,0 V240 M0,120 H480" stroke="#CC0001" strokeWidth="72"/>
      <circle cx="900" cy="160" r="35" fill="#FFFFFF"/>
      <circle cx="1100" cy="280" r="35" fill="#FFFFFF"/>
      <circle cx="1000" cy="450" r="35" fill="#FFFFFF"/>
      <circle cx="800" cy="420" r="35" fill="#FFFFFF"/>
      <circle cx="960" cy="310" r="20" fill="#FFFFFF"/>
    </svg>
  ),
  MY: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>(
        <rect key={i} width="800" height="30.77" y={i*30.77} fill={i%2===0?"#CC0001":"#FFFFFF"}/>
      ))}
      <rect width="400" height="215" fill="#010066"/>
      <circle cx="155" cy="107" r="75" fill="#FFCC00"/>
      <circle cx="175" cy="107" r="75" fill="#010066"/>
      <polygon points="245,55 252,78 276,78 257,92 264,115 245,101 226,115 233,92 214,78 238,78" fill="#FFCC00"/>
    </svg>
  ),
};

const DIAL_CODES = [
  { code: '91',  iso: 'IN', name: 'India' },
  { code: '1',   iso: 'US', name: 'USA / Canada' },
  { code: '44',  iso: 'GB', name: 'United Kingdom' },
  { code: '971', iso: 'AE', name: 'UAE' },
  { code: '65',  iso: 'SG', name: 'Singapore' },
  { code: '61',  iso: 'AU', name: 'Australia' },
  { code: '60',  iso: 'MY', name: 'Malaysia' },
];

function FlagIcon({ iso, width = 22 }) {
  const Svg = FLAGS[iso];
  if (!Svg) return null;
  return (
    <Box sx={{ width, height: width * 0.67, borderRadius: '2px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)', display: 'flex' }}>
      <Svg />
    </Box>
  );
}

export default function PhoneInput({
  label = 'Mobile Number',
  value = '',
  dialCode = '91',
  onChange,
  error,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const anchorRef       = useRef(null);
  const inputId         = 'phone-number-input';
  const selected        = DIAL_CODES.find(d => d.code === dialCode) || DIAL_CODES[0];

  const handleSelect    = (code) => { setOpen(false); onChange(value, code); };
  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
    onChange(digits, dialCode);
  };

  return (
    <FormControl fullWidth error={!!error} variant="outlined">
      <InputLabel htmlFor={inputId} sx={{ '&.Mui-focused': { color: '#1B4332' } }}>
        {label}
      </InputLabel>

      <OutlinedInput
        id={inputId}
        value={value}
        onChange={handlePhoneChange}
        inputMode="tel"
        disabled={disabled}
        placeholder={dialCode === '91' ? 'Enter your 10-digit number' : 'Enter your phone number'}
        label={label}
        sx={{
          borderRadius: '12px',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#C4C4C4' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2D6A4F' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1B4332' },
        }}
        startAdornment={
          <InputAdornment position="start" sx={{ mr: 0 }}>
            <Box
              ref={anchorRef}
              onClick={() => !disabled && setOpen(true)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                cursor: disabled ? 'default' : 'pointer', userSelect: 'none',
                py: 1.75, pl: 0, pr: 1.25, mr: 1.25,
                borderRight: '1px solid #E2E8F0',
                opacity: disabled ? 0.5 : 1,
                '&:hover': { opacity: disabled ? 0.5 : 0.75 },
              }}
            >
              <FlagIcon iso={selected.iso} width={22} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                +{selected.code}
              </Typography>
              <KeyboardArrowDown sx={{ fontSize: 15, color: '#94A3B8', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </Box>
            <Phone sx={{ color: '#94A3B8', fontSize: 20 }} />
          </InputAdornment>
        }
      />

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 0.5, borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220 } } }}
      >
        <MenuList disablePadding sx={{ py: 0.5 }}>
          {DIAL_CODES.map(d => (
            <MenuItem
              key={d.code}
              selected={d.code === dialCode}
              onClick={() => handleSelect(d.code)}
              sx={{
                gap: 1.5, py: 1,
                '&.Mui-selected': { bgcolor: 'rgba(27,67,50,0.08)' },
                '&:hover': { bgcolor: 'rgba(27,67,50,0.05)' },
              }}
            >
              <FlagIcon iso={d.iso} width={28} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1C1917', lineHeight: 1.3 }}>{d.name}</Typography>
                <Typography sx={{ fontSize: 12, color: '#78716C' }}>+{d.code}</Typography>
              </Box>
            </MenuItem>
          ))}
        </MenuList>
      </Popover>

      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
