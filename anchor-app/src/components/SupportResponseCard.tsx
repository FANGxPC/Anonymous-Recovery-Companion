import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronDown, ChevronUp, ShieldAlert, ShieldX, Lightbulb, BookOpen } from 'lucide-react';
import type { SupportResponse } from '../brain/contracts';
import { getResourceStatus } from '../blockchain/registry';
import type { ResourceInfo } from '../blockchain/registry';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
  response: SupportResponse;
}

export function SupportResponseCard({ response }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [registryInfo, setRegistryInfo] = useState<ResourceInfo | null>(null);

  React.useEffect(() => {
    if (!response.source) return;
    
    let id = "unknown-resource";
    const src = response.source.toLowerCase();
    if (src.includes('988') || src.includes('lifeline')) id = '988-lifeline';
    if (src.includes('samhsa')) id = 'samhsa-helpline';
    if (src.includes('outdated')) id = 'outdated-clinic';

    getResourceStatus(id).then(setRegistryInfo);
  }, [response.source]);

  return (
    <Card className="w-full shadow-md border-primary/20">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-lg">Recommended Strategy</CardTitle>
          </div>
          
          {/* Verification Badge */}
          {registryInfo && registryInfo.status === 'Verified' && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Source
            </Badge>
          )}
          
          {registryInfo && registryInfo.status === 'Revoked' && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 shadow-sm">
              <ShieldX className="w-3.5 h-3.5" />
              Revoked Source
            </Badge>
          )}

          {(!registryInfo || registryInfo.status === 'Unknown') && (
            <Badge variant="outline" className="bg-slate-50 text-slate-600 gap-1.5 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5" />
              Unverified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-2">
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <p className="whitespace-pre-line leading-relaxed text-foreground">
            {response.text}
          </p>
        </div>
      </CardContent>

      {response.source && (
        <CardFooter className="flex-col items-stretch pt-2 pb-6 px-6">
          <div className="border-t pt-4 mt-2">
            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto py-2 px-0 hover:bg-transparent"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                Source: {response.source}
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </Button>

            <AnimatePresence>
              {isExpanded && response.excerpt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 bg-muted/40 rounded-md border-l-2 border-l-primary/40 text-sm text-muted-foreground italic leading-relaxed">
                    "{response.excerpt}"
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
