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
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Results and Subscriptions</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Results</th>
            <th className="border border-gray-300 p-2">Subscriptions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">
              {results?.map((result, index) => (
                <div key={index} className="mb-2">{JSON.stringify(result)}</div>
              ))}
            </td>
            <td className="border border-gray-300 p-2">{JSON.stringify(subscriptions)}</td>
          </tr>
        </tbody>
      </table>

    </div>
  );
};

export default PaginationTable;
