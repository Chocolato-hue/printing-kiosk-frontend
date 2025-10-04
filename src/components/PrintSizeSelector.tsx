import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { PrintSize } from '../types/PrintOrder';

interface PrintSizeSelectorProps {
  sizes: PrintSize[];
  selectedSize: PrintSize | null;
  onSizeSelect: (size: PrintSize) => void;
  isResolutionSufficient: (size: PrintSize) => boolean;
  imageResolution: { width: number; height: number } | null;
}

const PrintSizeSelector: React.FC<PrintSizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  isResolutionSufficient,
  imageResolution
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="font-semibold text-gray-900 mb-4">Choose Print Size</h3>
      
      <div className="space-y-3">
        {sizes.map((size) => {
          const sufficient = imageResolution ? isResolutionSufficient(size) : true;
          const isSelected = selectedSize?.id === size.id;
          
          return (
            <div
              key={size.id}
              onClick={() => onSizeSelect(size)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : sufficient 
                    ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{size.name}</h4>
                      <p className="text-sm text-gray-600">{size.dimensions}</p>
                      <p className="text-sm text-gray-500">
                        Min resolution: {size.minResolution.width}×{size.minResolution.height}px
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">${size.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {imageResolution && (
                      sufficient ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )
                    )}
                    
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {imageResolution && !sufficient && (
                <div className="mt-3 text-sm text-red-600">
                  Current resolution: {imageResolution.width}×{imageResolution.height}px - Too low for quality printing
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {!imageResolution && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-700 text-sm">Upload an image to see size compatibility</p>
        </div>
      )}
    </div>
  );
};

export default PrintSizeSelector;