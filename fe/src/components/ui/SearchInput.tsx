import { Search } from 'lucide-react';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) {
	return (
		<div className={`relative ${className}`}>
			<Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface-light border border-border text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
			/>
		</div>
	);
}

