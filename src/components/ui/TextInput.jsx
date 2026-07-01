import { TextField } from '@mui/material';

/**
 * TextInput — thin MUI TextField wrapper with project-wide defaults.
 * Accepts all TextField props plus an `error` string shorthand.
 */
export default function TextInput({ error, ...props }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      error={!!error}
      helperText={error || props.helperText}
      {...props}
    />
  );
}
