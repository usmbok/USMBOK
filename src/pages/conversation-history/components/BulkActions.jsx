import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ 
  selectedCount, 
  onExportSelected, 
  onDeleteSelected, 
  onCreateFolder, 
  onAddToFolder,
  onClearSelection,
  folders = []
}) => {
  const [showFolderActions, setShowFolderActions] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const exportOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'txt', label: 'Text File' },
    { value: 'json', label: 'JSON Data' },
    { value: 'csv', label: 'CSV Spreadsheet' }
  ];

  const folderOptions = folders?.map(folder => ({
    value: folder?.id,
    label: folder?.name
  }));

  const handleExport = (format) => {
    onExportSelected(format);
  };

  const handleCreateFolder = () => {
    if (newFolderName?.trim()) {
      onCreateFolder(newFolderName?.trim());
      setNewFolderName('');
      setShowFolderActions(false);
    }
  };

  const handleAddToFolder = () => {
    if (selectedFolder) {
      onAddToFolder(selectedFolder);
      setSelectedFolder('');
      setShowFolderActions(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {selectedCount} conversation{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={16} className="mr-1" />
            Clear Selection
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Export
              <Icon name="ChevronDown" size={14} className="ml-1" />
            </Button>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                {exportOptions?.map((option) => (
                  <button
                    key={option?.value}
                    onClick={() => handleExport(option?.value)}
                    className="flex items-center w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    {option?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Folder Actions */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFolderActions(!showFolderActions)}
            >
              <Icon name="Folder" size={16} className="mr-2" />
              Organize
              <Icon name="ChevronDown" size={14} className="ml-1" />
            </Button>

            {showFolderActions && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowFolderActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-md shadow-lg z-50">
                  <div className="p-3 space-y-3">
                    {/* Create New Folder */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Create New Folder
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Folder name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e?.target?.value)}
                          className="flex-1 px-2 py-1 text-sm border border-border rounded"
                          onKeyPress={(e) => e?.key === 'Enter' && handleCreateFolder()}
                        />
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={handleCreateFolder}
                          disabled={!newFolderName?.trim()}
                        >
                          <Icon name="Plus" size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Add to Existing Folder */}
                    {folderOptions?.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Add to Existing Folder
                        </label>
                        <div className="flex space-x-2">
                          <Select
                            options={[{ value: '', label: 'Select folder...' }, ...folderOptions]}
                            value={selectedFolder}
                            onChange={setSelectedFolder}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={handleAddToFolder}
                            disabled={!selectedFolder}
                          >
                            <Icon name="FolderPlus" size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;