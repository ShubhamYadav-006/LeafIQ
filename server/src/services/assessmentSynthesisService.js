export class AssessmentSynthesisService {
  static synthesizeFinalAssessment(scan, visualEvidence, farmerAnswers) {
    const cropName = scan.crop_name || 'Crop';
    const initialCondition = scan.initial_condition || 'Unspecified Condition';
    let finalCondition = initialCondition;
    let finalConfidence = Number(scan.initial_confidence || 0.85);
    let concernLevel = scan.concern_level || 'attention';
    let summaryText = '';

    const visualCues = visualEvidence.map((e) => e.title);
    const farmerCues = [];

    // Analyze farmer responses
    let locationContext = '';
    let spreadContext = '';
    let moistureContext = '';

    for (const ans of farmerAnswers) {
      const qText = ans.question_text || '';
      const selected = (ans.selected_options || [])[0] || '';

      if (qText.includes('first notice')) {
        locationContext = selected;
        if (selected.includes('Older leaves')) {
          farmerCues.push('Symptoms first appeared on lower, older leaves');
        } else if (selected.includes('Newer leaves')) {
          farmerCues.push('Symptoms first appeared on young top foliage');
        } else if (selected.includes('Spread evenly')) {
          farmerCues.push('Symptoms distributed uniformly across canopy');
        }
      } else if (qText.includes('spreading')) {
        spreadContext = selected;
        if (selected.includes('rapidly')) {
          farmerCues.push('Rapid symptom progression over 2–4 days');
          // Rapid spread increases urgency
          if (concernLevel === 'attention') concernLevel = 'high_concern';
          finalConfidence = Math.min(0.95, finalConfidence + 0.05);
        } else if (selected.includes('gradually')) {
          farmerCues.push('Gradual symptom progression over 1–2 weeks');
        }
      } else if (qText.includes('watering') || qText.includes('weather')) {
        moistureContext = selected;
        if (selected.includes('overhead') || selected.includes('rain')) {
          farmerCues.push('High foliage wetness from overhead watering or recent rain');
          finalConfidence = Math.min(0.95, finalConfidence + 0.04);
        } else if (selected.includes('Drip')) {
          farmerCues.push('Leaves kept dry via drip irrigation');
        }
      }
    }

    // Check for ambiguity / contradiction
    if (locationContext.includes('Not sure') && spreadContext.includes('Not sure')) {
      finalConfidence = Math.max(0.40, finalConfidence - 0.10);
      summaryText = `Visual signs indicate possible ${finalCondition}. Field observations were limited, so regular monitoring is advised.`;
    } else {
      summaryText = `Synthesized visual evidence and field observations strongly suggest ${finalCondition} on ${cropName}. ${locationContext ? `Symptoms on ${locationContext.toLowerCase()}` : ''} match known disease progression patterns.`;
    }

    // Tiered Action Plan Generation
    const immediateActions = [];
    const monitoringSteps = [];
    const preventionSteps = [];
    let whenToSeekExpert = '';

    if (finalCondition.includes('Early Blight') || finalCondition.includes('Late Blight')) {
      immediateActions.push('Prune and safely dispose of heavily infected lower leaves (do not compost infected leaves).');
      immediateActions.push('Avoid overhead watering; direct irrigation to the soil base to keep leaves dry.');
      immediateActions.push('Sanitize shears and garden tools with rubbing alcohol between plants.');

      monitoringSteps.push('Inspect upper canopy leaves every 2–3 days for new dark spot formation.');
      monitoringSteps.push('Check nearby healthy plants for early leaf spot development.');

      preventionSteps.push('Ensure adequate row spacing to promote dry airflow through foliage.');
      preventionSteps.push('Apply organic mulch around the plant base to prevent soil splash during rain.');

      whenToSeekExpert = 'If dark lesions continue spreading rapidly to upper leaves despite dry foliage, consult local agricultural extension services.';
    } else if (finalCondition.includes('Bacterial Spot')) {
      immediateActions.push('Remove severely affected leaves during dry weather.');
      immediateActions.push('Avoid handling or harvesting plants while leaves are wet.');

      monitoringSteps.push('Monitor fruit and stems for raised dark specks or scabs.');
      monitoringSteps.push('Track whether leaf yellowing increases after rain events.');

      preventionSteps.push('Rotate crops out of Solanaceae family for 2–3 seasons.');
      preventionSteps.push('Use certified disease-free seeds and transplants.');

      whenToSeekExpert = 'If bacterial spots cover >30% of foliage across multiple plants, consult an agronomist for targeted copper-based control guidance.';
    } else if (finalCondition.includes('Healthy')) {
      immediateActions.push('No corrective action needed. Continue current good cultural practices.');
      monitoringSteps.push('Inspect leaves weekly for early signs of discoloration or pest damage.');
      preventionSteps.push('Maintain balanced soil moisture and healthy soil organic matter.');
      whenToSeekExpert = 'Consult an expert if unexplained yellowing or wilting occurs.';
    } else {
      immediateActions.push('Isolate affected plant parts by carefully trimming damaged leaf tips.');
      immediateActions.push('Keep leaf canopy dry and clean.');
      monitoringSteps.push('Check leaf undersides for pests or webbing.');
      preventionSteps.push('Maintain optimal plant spacing for ventilation.');
      whenToSeekExpert = 'If symptoms persist or worsen over 5 days, seek professional agricultural review.';
    }

    return {
      final_condition: finalCondition,
      final_confidence: Number(finalConfidence.toFixed(2)),
      concern_level: concernLevel,
      assessment_summary: summaryText,
      farmer_reported_cues: farmerCues,
      action_plan: {
        immediate_actions: immediateActions,
        monitoring_steps: monitoringSteps,
        prevention_steps: preventionSteps,
        when_to_seek_expert: whenToSeekExpert,
        disclaimer: 'LeafIQ provides an AI-assisted crop health assessment and should not be treated as a confirmed laboratory diagnosis.',
      },
    };
  }
}
