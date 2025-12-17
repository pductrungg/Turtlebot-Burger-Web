import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { MainTab } from './components/MainTab';
import { InstructionTab } from './components/InstructionTab';
import { SpecTab } from './components/SpecTab';

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header with Tabs */}
      <div className="border-b-2 border-black p-4 bg-slate-200">
        <Tabs defaultValue="main" className="w-full">
          <TabsList className="bg-transparent gap-2">
            <TabsTrigger 
              value="main" 
              className="border-2 border-black bg-slate-50 data-[state=active]:bg-slate-800 data-[state=active]:text-white px-8 py-2"
            >
              Main
            </TabsTrigger>
            <TabsTrigger 
              value="instruction"
              className="border-2 border-black bg-slate-50 data-[state=active]:bg-slate-800 data-[state=active]:text-white px-8 py-2"
            >
              Instruction
            </TabsTrigger>
            <TabsTrigger 
              value="spec"
              className="border-2 border-black bg-slate-50 data-[state=active]:bg-slate-800 data-[state=active]:text-white px-8 py-2"
            >
              Spec
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="mt-0">
            <MainTab />
          </TabsContent>
          
          <TabsContent value="instruction" className="mt-0">
            <InstructionTab />
          </TabsContent>
          
          <TabsContent value="spec" className="mt-0">
            <SpecTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}