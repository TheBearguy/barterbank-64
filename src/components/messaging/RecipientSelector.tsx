
import React from 'react';
import { UserRound, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Recipient {
  id: string;
  name: string;
}

interface RecipientSelectorProps {
  recipients: Recipient[];
  selectedRecipientId: string;
  onSelectRecipient: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isReplyMode: boolean;
  replyToName?: string;
}

const RecipientSelector = ({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  searchTerm,
  onSearchChange,
  isReplyMode,
  replyToName
}: RecipientSelectorProps) => {
  // Case-insensitive filtering of recipients
  const filteredRecipients = recipients.filter(r => 
    !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecipientClick = (id: string) => {
    console.log("Recipient clicked:", id);
    onSelectRecipient(id);
  };

  return (
    <div className="space-y-2">
      {!isReplyMode ? (
        <>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipients..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="border rounded-md max-h-48 overflow-y-auto">
            {recipients.length > 0 ? (
              <ul className="divide-y">
                {filteredRecipients.length > 0 ? (
                  filteredRecipients.map((recipient) => (
                    <li 
                      key={recipient.id}
                      className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 ${
                        selectedRecipientId === recipient.id ? 'bg-gray-50 dark:bg-gray-800' : ''
                      }`}
                      onClick={() => handleRecipientClick(recipient.id)}
                    >
                      <UserRound className="h-4 w-4 text-gray-400" />
                      <span>{recipient.name || 'Unknown'}</span>
                      {selectedRecipientId === recipient.id && (
                        <span className="ml-auto text-xs bg-primary text-white px-1.5 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">
                    No matching recipients found
                  </li>
                )}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No recipients available
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
          <UserRound className="h-4 w-4 text-gray-400" />
          <span>{replyToName}</span>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;
