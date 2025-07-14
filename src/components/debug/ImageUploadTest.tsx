import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { uploadPropertyImages } from '@/services/storage';
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug component to test image upload functionality
 * This helps verify that the image upload fix is working correctly
 */
export const ImageUploadTest: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testImageUpload = async () => {
    setIsUploading(true);
    setTestResults([]);
    
    try {
      addResult('Starting image upload test...');
      
      // Create a test property first
      addResult('Creating test property...');
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          title: 'Test Property for Image Upload',
          description: 'This is a test property to verify image upload functionality',
          price: 100000,
          location: 'Test Location',
          address: 'Test Address',
          bedrooms: 2,
          bathrooms: 1,
          size: 1000,
          featured: false,
          status: 'For Sale',
          agent_id: 1 // Assuming agent with ID 1 exists
        })
        .select()
        .single();

      if (propertyError) {
        addResult(`❌ Failed to create test property: ${propertyError.message}`);
        return;
      }

      addResult(`✅ Test property created with ID: ${property.id}`);

      // Create a test image file
      addResult('Creating test image file...');
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('TEST', 35, 55);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });
      
      const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
      addResult(`✅ Test image file created: ${testFile.name} (${testFile.size} bytes)`);

      // Test image upload to storage
      addResult('Uploading image to storage...');
      const uploadResults = await uploadPropertyImages([testFile], property.id);
      
      if (uploadResults.length === 0 || !uploadResults[0].success) {
        addResult(`❌ Image upload failed: ${uploadResults[0]?.error || 'Unknown error'}`);
        return;
      }

      const imageUrl = uploadResults[0].url!;
      addResult(`✅ Image uploaded successfully: ${imageUrl}`);

      // Test saving image URL to database
      addResult('Saving image URL to database...');
      const { error: imageError } = await supabase
        .from('property_images')
        .insert({
          property_id: property.id,
          image_url: imageUrl
        });

      if (imageError) {
        addResult(`❌ Failed to save image URL to database: ${imageError.message}`);
        return;
      }

      addResult('✅ Image URL saved to database successfully');

      // Verify the image was saved
      addResult('Verifying image was saved...');
      const { data: savedImages, error: fetchError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id);

      if (fetchError) {
        addResult(`❌ Failed to fetch saved images: ${fetchError.message}`);
        return;
      }

      addResult(`✅ Found ${savedImages.length} image(s) for the test property`);

      // Clean up - delete the test property and its images
      addResult('Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id);

      if (deleteError) {
        addResult(`⚠️ Failed to clean up test property: ${deleteError.message}`);
      } else {
        addResult('✅ Test data cleaned up successfully');
      }

      addResult('🎉 Image upload test completed successfully!');
      
      toast({
        title: "Test Completed",
        description: "Image upload functionality is working correctly!",
        variant: "default"
      });

    } catch (error) {
      addResult(`❌ Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Test Failed",
        description: "Image upload test encountered an error. Check the results for details.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Image Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testImageUpload} 
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Running Test...' : 'Test Image Upload'}
        </Button>
        
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
