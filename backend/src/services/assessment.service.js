export class AssessmentSynthesisService {
  static generateActionPlanForCondition(cropName = 'Crop', condition = 'Unspecified Condition', concernLevel = 'attention') {
    const normCondition = condition.toLowerCase();
    const immediateActions = [];
    const monitoringSteps = [];
    const preventionSteps = [];
    let whenToSeekExpert = '';
    let visibleSymptoms = '';

    if (normCondition.includes('early blight')) {
      visibleSymptoms = `Dark brown to black concentric target-like spots with yellow chlorotic halos, starting predominantly on lower older leaves.`;
      immediateActions.push('Prune and safely discard heavily infected lower foliage (do not compost infected plant parts).');
      immediateActions.push('Direct irrigation to the soil base to avoid splashing water onto foliage.');
      immediateActions.push('Sanitize pruning shears with rubbing alcohol or a 10% bleach solution between cuts.');
      monitoringSteps.push('Inspect middle and upper canopy leaves every 2–3 days for newly forming concentric brown rings.');
      monitoringSteps.push('Monitor adjacent plants in the same row for early lesion spread.');
      preventionSteps.push('Apply a 2-inch layer of clean organic mulch around base to create a physical barrier against soil-borne fungal spores.');
      preventionSteps.push('Maintain generous plant spacing (18–24 inches) to ensure maximum airflow and rapid morning drying.');
      preventionSteps.push('Rotate with non-solanaceous crops for at least 2–3 seasons.');
      whenToSeekExpert = 'If leaf spot lesions advance into the upper third of the canopy within 5 days despite lower foliage pruning, consult local extension services.';
    } else if (normCondition.includes('late blight')) {
      visibleSymptoms = `Water-soaked dark lesions that expand rapidly across leaves and stems, with fuzzy white fungal growth on undersides in humid conditions.`;
      immediateActions.push('Immediately remove and bag all severely affected foliage to prevent wind-borne spore dispersal.');
      immediateActions.push('Ensure plants remain strictly dry; suspend overhead sprinkler irrigation.');
      immediateActions.push('Isolate the affected planting area to prevent spreading spores on clothing and tools.');
      monitoringSteps.push('Conduct daily morning leaf inspections across the entire field/garden.');
      monitoringSteps.push('Check stems and fruit for brown greasy-looking water-soaked lesions.');
      preventionSteps.push('Plant certified disease-resistant crop varieties in well-drained soil.');
      preventionSteps.push('Space rows widely to allow morning dew to evaporate rapidly.');
      whenToSeekExpert = 'Late blight is highly contagious and aggressive. Seek immediate guidance from an agronomist if multiple plants show rapid dark decay.';
    } else if (normCondition.includes('bacterial spot') || normCondition.includes('bacterial speck')) {
      visibleSymptoms = `Small angular, water-soaked dark spots that may turn greasy, often surrounded by yellow halos, causing leaf yellowing and premature leaf drop.`;
      immediateActions.push('Avoid touching or working among crops when foliage is wet from rain or dew.');
      immediateActions.push('Prune out heavily infected leaves during dry, sunny weather.');
      immediateActions.push('Disinfect all tools and stakes after handling affected plants.');
      monitoringSteps.push('Track whether spots multiply or yellowing increases following rain or heavy humidity.');
      monitoringSteps.push('Inspect green fruit for small dark raised scabs or water-soaked specks.');
      preventionSteps.push('Use certified pathogen-free seeds and disease-resistant transplants.');
      preventionSteps.push('Switch to drip or soaker hose irrigation to keep foliage completely dry.');
      preventionSteps.push('Practice a 2 to 3-year crop rotation away from peppers and tomatoes.');
      whenToSeekExpert = 'If bacterial spots cover >30% of the leaf canopy across multiple beds, consult an agricultural expert regarding copper-based bactericides.';
    } else if (normCondition.includes('powdery mildew')) {
      visibleSymptoms = `Distinct white or grey talcum-powder-like patches on leaf surfaces, causing leaves to curl, yellow, and wither.`;
      immediateActions.push('Prune overcrowded branches to allow direct sunlight penetration into the inner canopy.');
      immediateActions.push('Wipe or prune infected leaf sections in early morning hours.');
      monitoringSteps.push('Check the upper surfaces of older and sheltered leaves every 3–4 days.');
      monitoringSteps.push('Monitor shaded crop rows where relative humidity remains elevated.');
      preventionSteps.push('Plant in locations with at least 6–8 hours of full direct sun.');
      preventionSteps.push('Apply organic horticultural oils or potassium bicarbonate sprays as an early preventive wash.');
      preventionSteps.push('Avoid excessive nitrogen fertilization, which produces overly tender susceptible growth.');
      whenToSeekExpert = 'If powdery coating spreads to >50% of foliage and stunts flowering or fruit set, seek agronomist advice.';
    } else if (normCondition.includes('rust')) {
      visibleSymptoms = `Reddish-orange or golden-brown powdery pustules on the underside of leaves with corresponding pale yellow spots on the upper leaf surface.`;
      immediateActions.push('Gently remove leaves bearing active spore pustules into a plastic bag.');
      immediateActions.push('Water only at ground level; rust spores require free moisture to germinate.');
      monitoringSteps.push('Check leaf undersides weekly, especially during warm, humid weather.');
      preventionSteps.push('Clear away and burn or bury fallen crop debris in autumn.');
      preventionSteps.push('Maintain wide row spacing to promote low canopy humidity.');
      whenToSeekExpert = 'If rust pustules cover extensive foliage and cause premature defoliation, consult agricultural extension.';
    } else if (normCondition.includes('healthy')) {
      visibleSymptoms = `Vibrant, uniform green coloration with intact cellular structure, clean veins, and no necrotic lesions, spots, or abnormal curling.`;
      immediateActions.push('No corrective treatment required! Continue current sound agricultural and cultivation practices.');
      monitoringSteps.push('Inspect foliage once a week during routine watering for early signs of discoloration or insect pests.');
      preventionSteps.push('Maintain balanced soil fertility and optimal moisture levels.');
      preventionSteps.push('Ensure regular weeding to remove potential alternate host weeds.');
      whenToSeekExpert = 'Reach out for agricultural advice only if unexpected yellowing, wilting, or stunting appears.';
    } else {
      visibleSymptoms = `Localized leaf tissue discoloration, spotting, or leaf margin distress consistent with ${condition}.`;
      immediateActions.push('Carefully remove damaged or discolored leaf tissue using clean shears.');
      immediateActions.push('Keep leaves dry by watering only at the base of the stem.');
      immediateActions.push('Clean and sanitize all garden equipment.');
      monitoringSteps.push('Check the underside of leaves for microscopic pests, webbing, or developing spots.');
      monitoringSteps.push('Observe plant vigor over the next 4–7 days.');
      preventionSteps.push('Ensure adequate plant spacing for good air circulation.');
      preventionSteps.push('Maintain healthy soil rich in organic compost.');
      whenToSeekExpert = `If symptoms persist, spread to new growth, or worsen over 5 days, seek professional agronomic evaluation.`;
    }

    return {
      visible_symptoms: visibleSymptoms,
      immediate_actions: immediateActions,
      monitoring_steps: monitoringSteps,
      prevention_steps: preventionSteps,
      when_to_seek_expert: whenToSeekExpert,
      disclaimer: 'LeafIQ provides an AI-assisted crop health assessment based on image visual cues and should not be treated as a definitive laboratory diagnosis.',
    };
  }

  static synthesizeFinalAssessment(scan, visualEvidence, farmerAnswers = []) {
    const cropName = scan.crop_name || 'Crop';
    const finalCondition = scan.final_condition || scan.initial_condition || 'Unspecified Condition';
    const finalConfidence = Number(scan.final_confidence || scan.initial_confidence || 0.85);
    const concernLevel = scan.concern_level || (finalCondition.toLowerCase().includes('healthy') ? 'healthy' : 'attention');

    const plan = this.generateActionPlanForCondition(cropName, finalCondition, concernLevel);
    const summaryText = scan.assessment_summary ||
      `Visual examination indicates ${finalCondition} on ${cropName} (${(finalConfidence * 100).toFixed(0)}% confidence). ${plan.visible_symptoms}`;

    return {
      final_condition: finalCondition,
      final_confidence: Number(finalConfidence.toFixed(2)),
      concern_level: concernLevel,
      assessment_summary: summaryText,
      farmer_reported_cues: [],
      action_plan: {
        immediate_actions: plan.immediate_actions,
        monitoring_steps: plan.monitoring_steps,
        prevention_steps: plan.prevention_steps,
        when_to_seek_expert: plan.when_to_seek_expert,
        disclaimer: plan.disclaimer,
      },
    };
  }
}


