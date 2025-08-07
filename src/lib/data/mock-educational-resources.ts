
import type { EducationalResource } from '@/lib/types';

export let mockEducationalResources: EducationalResource[] = [
  { 
    id: 'edu1', 
    title: 'Understanding Your Knee Pain', 
    type: 'article', 
    summary: 'Learn about common causes of knee pain and when to see a specialist. This article covers topics such as osteoarthritis, ligament injuries, and patellofemoral pain syndrome, offering insights into symptoms and potential treatments.', 
    content: 'Full article content for Understanding Your Knee Pain goes here... (More details about osteoarthritis, ligament injuries, and patellofemoral pain syndrome. It would discuss symptoms like swelling, instability, and pain during specific activities. Treatment options could range from RICE, physical therapy exercises, to surgical interventions for severe cases.)',
    thumbnailUrl: 'https://placehold.co/300x170.png?text=Knee+Pain', 
    tags: ['knee', 'pain management', 'osteoarthritis'], 
    estimatedReadTime: '5 min read',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  { 
    id: 'edu2', 
    title: 'Benefits of Regular Stretching', 
    type: 'video', 
    summary: 'Discover how stretching can improve flexibility, reduce injury risk, and enhance recovery. This video demonstrates key stretches for major muscle groups.', 
    contentUrl: 'https://www.youtube.com/watch?v=rokGy0huYEA', 
    thumbnailUrl: 'https://placehold.co/300x170.png?text=Stretching+Video', 
    tags: ['flexibility', 'recovery', 'warm-up'], 
    estimatedReadTime: '3 min watch',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  { 
    id: 'edu3', 
    title: 'Core Strengthening Essentials', 
    type: 'article', 
    summary: 'A guide to fundamental core exercises for better stability and posture. Includes explanations of why core strength is vital and how to perform exercises like planks, bird-dogs, and dead bugs safely.', 
    content: 'Detailed guide on core exercises. Explains the importance of a strong core for everyday activities and athletic performance. Provides step-by-step instructions for plank variations, bird-dog, dead bug, and modified crunches. Discusses common mistakes and how to avoid them.',
    thumbnailUrl: 'https://placehold.co/300x170.png?text=Core+Strength', 
    tags: ['core', 'strength', 'posture'], 
    estimatedReadTime: '7 min read',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  { 
    id: 'edu4', 
    title: 'Managing Lower Back Pain at Home', 
    type: 'video', 
    summary: 'Tips and exercises for alleviating common lower back pain without equipment. Focuses on gentle mobility and self-care techniques.', 
    contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    thumbnailUrl: 'https://placehold.co/300x170.png?text=Back+Pain+Home', 
    tags: ['back pain', 'home exercise', 'self-care'], 
    estimatedReadTime: '6 min watch',
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  { 
    id: 'edu5', 
    title: 'Nutrition for Optimal Recovery', 
    type: 'article', 
    summary: 'Understand how diet plays a crucial role in healing and muscle repair after injury. Covers macronutrients, micronutrients, and hydration strategies to support your body\'s recovery process.', 
    content: 'Comprehensive article on nutrition for recovery. Discusses the role of protein in muscle repair, carbohydrates for energy replenishment, healthy fats for inflammation control, and key vitamins/minerals like Vitamin C, Vitamin D, Zinc, and Omega-3s. Includes sample meal ideas and hydration tips.',
    thumbnailUrl: 'https://placehold.co/300x170.png?text=Recovery+Nutrition', 
    tags: ['nutrition', 'recovery', 'diet', 'healing'], 
    estimatedReadTime: '8 min read',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  { 
    id: 'edu6', 
    title: 'Introduction to Telehealth in Physiotherapy', 
    type: 'article', 
    summary: 'What to expect from remote physiotherapy sessions and how to make the most of them. This guide helps you prepare for virtual appointments and understand the benefits of telehealth.', 
    content: 'An introductory guide to telehealth for physiotherapy patients. Explains how virtual assessments are conducted, what technology is needed, tips for setting up your space for a telehealth session, and the types of conditions that can be effectively managed remotely. Also addresses common concerns about privacy and effectiveness.',
    thumbnailUrl: 'https://placehold.co/300x170.png?text=Telehealth+Guide', 
    tags: ['telehealth', 'patient guide', 'virtual care'], 
    status: 'archived',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const addEducationalResource = (newResourceData: Omit<EducationalResource, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newResource: EducationalResource = {
    ...newResourceData,
    id: `edu${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEducationalResources = [newResource, ...mockEducationalResources];
};

export const updateEducationalResource = (updatedResource: EducationalResource) => {
  const index = mockEducationalResources.findIndex(r => r.id === updatedResource.id);
  if (index !== -1) {
    mockEducationalResources[index] = { ...updatedResource, updatedAt: new Date().toISOString() };
  } else {
    mockEducationalResources = [{ ...updatedResource, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...mockEducationalResources];
  }
  mockEducationalResources = [...mockEducationalResources];
};
