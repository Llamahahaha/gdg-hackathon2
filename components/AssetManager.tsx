"use client";

import React, { useState, useEffect } from 'react';
import { storage, db, auth } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { FileText, Music, Video, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function AssetManager() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    if (!user || !db) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'assets'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedAssets: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedAssets.push({ id: doc.id, ...doc.data() });
      });
      setAssets(fetchedAssets.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !storage || !db) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `users/${user.uid}/assets/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Save metadata to Firestore
        await addDoc(collection(db, 'assets'), {
          userId: user.uid,
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          createdAt: serverTimestamp()
        });

        setIsUploading(false);
        setFile(null);
        fetchAssets();
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Secure Asset Upload
        </h3>
        
        <div className="flex flex-col md:flex-row gap-4">
          <label className="flex-1 cursor-pointer group">
            <div className="h-full border-2 border-dashed border-white/10 group-hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center p-8 transition-all bg-black/20">
              <input type="file" className="hidden" onChange={handleFileChange} />
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-cyan-500/10 transition-colors">
                <FileText className="w-6 h-6 text-white/30 group-hover:text-cyan-400" />
              </div>
              <span className="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest">
                {file ? file.name : 'Select Tactical Audio or Video'}
              </span>
            </div>
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {Math.round(uploadProgress)}%
              </>
            ) : (
              'Upload to Cloud'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : assets.length > 0 ? (
          assets.map((asset) => (
            <div key={asset.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                  {asset.type.includes('audio') ? (
                    <Music className="w-5 h-5 text-blue-400" />
                  ) : asset.type.includes('video') ? (
                    <Video className="w-5 h-5 text-rose-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate uppercase tracking-widest">{asset.name}</p>
                  <p className="text-[8px] text-white/30 uppercase tracking-tighter">
                    {(asset.size / 1024 / 1024).toFixed(2)} MB • {asset.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <a 
                  href={asset.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 opacity-0 group-hover:opacity-100 bg-white/5 rounded-lg hover:bg-cyan-500 hover:text-black transition-all"
                >
                  <Check className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-white/5 rounded-2xl bg-black/10">
            <p className="text-xs text-white/20 uppercase tracking-[0.2em]">No assets found in your vault</p>
          </div>
        )}
      </div>
    </div>
  );
}
