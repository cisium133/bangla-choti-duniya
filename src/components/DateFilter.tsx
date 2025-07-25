import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface DateFilterProps {
  onDateChange: (startDate?: Date, endDate?: Date) => void;
}

export const DateFilter = ({ onDateChange }: DateFilterProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (date?: Date) => {
    setStartDate(date);
    onDateChange(date, endDate);
  };

  const handleEndDateChange = (date?: Date) => {
    setEndDate(date);
    onDateChange(startDate, date);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onDateChange();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          তারিখ ফিল্টার
          {(startDate || endDate) && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
              {startDate && endDate ? '2' : '1'}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 space-y-4" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">তারিখ অনুযায়ী ফিল্টার</h4>
            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                পরিষ্কার
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">শুরুর তারিখ</label>
              <div className="border rounded-md">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  locale={bn}
                  className="p-3"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">শেষ তারিখ</label>
              <div className="border rounded-md">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  locale={bn}
                  className="p-3"
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </div>
            </div>
          </div>
          
          {(startDate || endDate) && (
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {startDate && format(startDate, 'dd MMM yyyy', { locale: bn })}
                  {startDate && endDate && ' - '}
                  {endDate && format(endDate, 'dd MMM yyyy', { locale: bn })}
                </span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => setIsOpen(false)} 
            className="w-full"
          >
            প্রয়োগ করুন
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};