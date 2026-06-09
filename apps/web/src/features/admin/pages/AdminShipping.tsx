import { useState } from 'react';
import { Truck, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAdminShipping } from '../hooks/useAdminShipping';
import { LoadingSpinner } from '@/shared/components/ui/Loading';
import { Button } from '@/shared/components/ui/Button';

const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara', 'Other'
];

export function AdminShipping() {
  const { useShippingRates, toggleShippingRate, bulkUpdateRates } = useAdminShipping();
  const { data: rates, isLoading } = useShippingRates();
  const [editedRates, setEditedRates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handlePriceChange = (rateId: string, price: number) => {
    setEditedRates(prev => ({ ...prev, [rateId]: price }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updates = Object.entries(editedRates).map(([id, price]) => ({ id, price }));
    
    if (updates.length > 0) {
      await bulkUpdateRates.mutateAsync(updates);
      setEditedRates({});
    }
    setIsSaving(false);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    await toggleShippingRate.mutateAsync({ id, active: !currentActive });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const shippingRates = rates || [];

  // Group rates by state
  const ratesByState = NIGERIA_STATES.map(state => {
    const carParkRate = shippingRates.find((r: any) => r.stateName === state && r.shippingMethod === 'AUTHORIZED_CAR_PARK');
    const deliveryRate = shippingRates.find((r: any) => r.stateName === state && r.shippingMethod === 'DELIVERY_COMPANY');
    return {
      state,
      carPark: carParkRate,
      delivery: deliveryRate,
    };
  });

  const hasChanges = Object.keys(editedRates).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Rates</h1>
          <p className="text-gray-600 mt-1">Manage shipping costs for all states</p>
        </div>
        {hasChanges && (
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save size={20} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* Shipping Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Car Park (₦)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Delivery Company (₦)</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ratesByState.map(({ state, carPark, delivery }) => (
                <tr key={state} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{state}</td>
                  
                  {/* Car Park Rate */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={editedRates[carPark?.id] ?? carPark?.price ?? 0}
                        onChange={(e) => carPark && handlePriceChange(carPark.id, Number(e.target.value))}
                        disabled={!carPark?.active}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C08081] disabled:bg-gray-100"
                      />
                      <button
                        onClick={() => carPark && handleToggle(carPark.id, carPark.active)}
                        className={`transition-colors ${carPark?.active ? 'text-green-600' : 'text-gray-400'}`}
                        title={carPark?.active ? 'Active' : 'Inactive'}
                      >
                        {carPark?.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                  </td>

                  {/* Delivery Rate */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={editedRates[delivery?.id] ?? delivery?.price ?? 0}
                        onChange={(e) => delivery && handlePriceChange(delivery.id, Number(e.target.value))}
                        disabled={!delivery?.active}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C08081] disabled:bg-gray-100"
                      />
                      <button
                        onClick={() => delivery && handleToggle(delivery.id, delivery.active)}
                        className={`transition-colors ${delivery?.active ? 'text-green-600' : 'text-gray-400'}`}
                        title={delivery?.active ? 'Active' : 'Inactive'}
                      >
                        {delivery?.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                  </td>

                  {/* Combined Status */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${(carPark?.active || delivery?.active) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    `}>
                      {(carPark?.active || delivery?.active) ? 'Available' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Truck className="text-blue-600 mt-0.5" size={20} />
        <div>
          <h3 className="font-medium text-blue-900">Shipping Methods</h3>
          <p className="text-sm text-blue-700 mt-1">
            <strong>Car Park:</strong> Customer picks up from authorized car park locations<br />
            <strong>Delivery Company:</strong> Door-to-door delivery via third-party courier
          </p>
        </div>
      </div>
    </div>
  );
}
