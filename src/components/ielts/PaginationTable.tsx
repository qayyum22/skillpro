"use client";
import React from "react";

interface PaginationTableProps {
  results?: resultsProps[];
  subscriptions?: subscriptionsProps;
}

interface resultsProps {
  test_id: string;
  test_type: string;
  module: string;
  bands: string;
  download_link: string;
  created_at: string;
}

interface subscriptionsProps {
  plan: string;
  purchaseDate: string;
  expiryDate: string;
  price: number;
}

const PaginationTable: React.FC<PaginationTableProps> = ({
  results,
  subscriptions,
}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Results and Subscriptions</h1>

      <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
        <tr>
          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Results</th>
          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Subscriptions</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td className="py-4 px-4 border-t border-gray-200">
          {results?.map((result, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-50 rounded-lg shadow-sm">
            <p><strong>Test ID:</strong> {result.test_id}</p>
            <p><strong>Test Type:</strong> {result.test_type}</p>
            <p><strong>Module:</strong> {result.module}</p>
            <p><strong>Bands:</strong> {result.bands}</p>
            <p><strong>Download Link:</strong> <a href={result.download_link} className="text-blue-500 underline">Download</a></p>
            <p><strong>Created At:</strong> {result.created_at}</p>
            </div>
          ))}
          </td>
          <td className="py-4 px-4 border-t border-gray-200">
          {subscriptions && (
            <div className="p-2 bg-gray-50 rounded-lg shadow-sm">
            <p><strong>Plan:</strong> {subscriptions.plan}</p>
            <p><strong>Purchase Date:</strong> {subscriptions.purchaseDate}</p>
            <p><strong>Expiry Date:</strong> {subscriptions.expiryDate}</p>
            <p><strong>Price:</strong> ${subscriptions.price}</p>
            </div>
          )}
          </td>
        </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default PaginationTable;
