import React from 'react';

export const QuizCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-blue-300 rounded w-24"></div>
        </div>
    </div>
);

export const QuestionCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
        </div>
    </div>
);

export const ResultCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
        <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto mb-6"></div>
        <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-6"></div>
        <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
        </div>
    </div>
);