import { useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { listMethods } from "../services/methods";
import type { Method } from "../services/methods";
import { useSavedMethods } from "../hooks/useSavedMethods";
import { completeMethod } from "../services/achievementOperations";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Heart, Clock, Tag, Trophy } from "lucide-react";

export default function MethodDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const methodId = searchParams.get("id");

  const [method, setMethod] = useState<Method | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mastering, setMastering] = useState(false);
  const [masteringSuccess, setMasteringSuccess] = useState(false);
  const { savedIds, savingId, toggleSave } = useSavedMethods();

  const handleMasterMethod = async () => {
    if (!method || !methodId) return;

    setMastering(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("You need to be logged in to master a method");
        return;
      }

      await completeMethod(user.id, Number(methodId), "", undefined);
      setMasteringSuccess(true);
      setTimeout(() => setMasteringSuccess(false), 3000);
    } catch (err) {
      alert(
        "Failed to master method: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setMastering(false);
    }
  };

  useEffect(() => {
    let abort = false;

    const loadMethod = async () => {
      setLoading(true);
      setError(null);
      try {
        const methods = await listMethods();
        if (abort) return;

        const found = methods.find((m) => String(m.id) === methodId);
        if (!found) {
          setError("Method not found");
        } else {
          setMethod(found);
        }
      } catch (err) {
        if (!abort) {
          setError(
            err instanceof Error ? err.message : "Failed to load method"
          );
        }
      } finally {
        if (!abort) setLoading(false);
      }
    };

    loadMethod();

    return () => {
      abort = true;
    };
  }, [methodId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error || !method) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen bg-base-100 p-4 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm self-start"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="alert alert-error">{error || "Method not found"}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-base-100 p-4 gap-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost btn-sm self-start"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Method Image */}
      <div className="w-full rounded-lg overflow-hidden bg-base-200 h-64">
        <img
          src={method.image_url || "https://placehold.co/400x300"}
          alt={method.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Method Header */}
      <div className="w-full card card-bordered p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{method.title}</h1>
          </div>
          <button
            onClick={() => toggleSave(String(method.id))}
            disabled={savingId === String(method.id)}
            className="btn btn-sm btn-circle"
          >
            <Heart
              size={20}
              className={
                savedIds.has(String(method.id)) ? "fill-current text-error" : ""
              }
            />
          </button>
        </div>

        {/* Category and Duration */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <span className="text-sm font-medium">{method.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="text-sm font-medium">{method.duration}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="w-full card card-bordered p-4">
        <h2 className="font-bold text-lg mb-2">Description</h2>
        <p className="text-base-content/80 whitespace-pre-wrap">
          {method.description}
        </p>
      </div>

      {/* Steps */}
      {method.steps && method.steps.length > 0 && (
        <div className="w-full card card-bordered p-4">
          <h2 className="font-bold text-lg mb-4">Steps</h2>
          <div className="space-y-4">
            {method.steps
              .sort((a, b) => a.order - b.order)
              .map((step) => (
                <div key={step.order} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-sm">
                      {step.order}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{step.title}</h3>
                    <p className="text-base-content/80 text-sm mt-1 whitespace-pre-wrap">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {method.created_at && (
        <div className="w-full card card-bordered p-4 text-sm text-base-content/60">
          <p>Created on {new Date(method.created_at).toLocaleDateString()}</p>
        </div>
      )}

      {/* Master Method Button */}
      <button
        onClick={handleMasterMethod}
        disabled={mastering}
        className={`btn btn-lg w-full gap-2 ${
          masteringSuccess ? "btn-success" : "btn-primary"
        } mb-4`}
      >
        <Trophy size={20} />
        {masteringSuccess ? "Method Mastered! ✓" : "Master This Method"}
      </button>
    </div>
  );
}
