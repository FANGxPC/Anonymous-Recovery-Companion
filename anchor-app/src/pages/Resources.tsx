import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, Activity, AlertTriangle } from 'lucide-react';
import { getResourceStatus } from '../blockchain/registry';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Resource {
  id: string;
  name: string;
  url: string;
  status: 'Unknown' | 'Verified' | 'Revoked';
  date: Date | null;
}

export function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // We test with a hardcoded list of resources to query against the registry
  const resourceIdsToQuery = [
    '988-lifeline',
    'samhsa-helpline',
    'outdated-clinic'
  ];

  useEffect(() => {
    async function loadResources() {
      const results = await Promise.all(
        resourceIdsToQuery.map(async id => {
          const status = await getResourceStatus(id);
          return { id, ...status };
        })
      );
      setResources(results);
      setLoading(false);
    }
    loadResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 space-y-6 pb-24">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Verified Resources
          </h1>
          <p className="text-muted-foreground mt-1">Cryptographically verified crisis contacts.</p>
        </div>
      </header>

      <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50">
        <CardContent className="p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <p>
            These helplines are verified via an Ethereum smart contract registry. 
            This prevents bad actors from injecting fake or scam treatment centers into the app.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Activity className="w-8 h-8 animate-pulse text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id} className={resource.status === 'Revoked' ? 'opacity-60 grayscale' : ''}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{resource.name || resource.id}</h3>
                    
                    <div className="flex items-center gap-2">
                      {resource.status === 'Verified' && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                        </Badge>
                      )}
                      {resource.status === 'Revoked' && (
                        <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Revoked
                        </Badge>
                      )}
                      {resource.status === 'Unknown' && (
                        <Badge variant="secondary">Unknown Status</Badge>
                      )}
                      
                      {resource.date && (
                        <span className="text-xs text-muted-foreground">
                          {resource.status === 'Revoked' ? 'Revoked on ' : 'Verified on '}
                          {resource.date.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant={resource.status === 'Revoked' ? "secondary" : "default"}
                    disabled={resource.status === 'Revoked'}
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Visit Resource <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
                
                {resource.status === 'Revoked' && (
                  <div className="mt-4 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
                    This resource was cryptographically revoked from the trusted registry and has been disabled to protect your safety.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
