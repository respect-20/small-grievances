import {defineField, defineType} from 'sanity'

export const grievance = defineType({
  name: 'grievance',
  title: 'Grievance',
  type: 'document',
  fields: [
    defineField({
      name: 'caseNumber',
      title: 'Case Number',
      type: 'string',
      readOnly: true,
      description: 'Auto-assigned on filing, e.g. DSG-0001',
    }),
    defineField({
      name: 'title',
      title: 'Short Description',
      type: 'string',
      description: 'One line summary of the offense, e.g. "Left dishes in sink for four days"',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Kitchen Crimes', value: 'kitchen-crimes'},
          {title: 'Shared Space Violations', value: 'shared-space'},
          {title: 'Digital Etiquette', value: 'digital-etiquette'},
          {title: 'Noise Pollution', value: 'noise-pollution'},
          {title: 'Miscellaneous Pettiness', value: 'miscellaneous'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'severity',
      title: 'Pettiness Level',
      type: 'number',
      description: '1 = mildly annoying, 5 = unforgivable',
      options: {list: [1, 2, 3, 4, 5]},
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'complainant',
      title: 'Complainant',
      type: 'string',
      description: 'Name of the person filing the grievance',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'respondent',
      title: 'Respondent',
      type: 'string',
      description: 'Name of the accused party',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Full Complaint',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required().min(20),
    }),
    defineField({
      name: 'evidence',
      title: 'Evidence',
      type: 'array',
      of: [{type: 'image'}],
    }),
    defineField({
      name: 'status',
      title: 'Case Status',
      type: 'string',
      initialValue: 'filed',
      options: {
        list: [
          {title: 'Filed', value: 'filed'},
          {title: 'Under Review', value: 'under-review'},
          {title: 'Ruling Issued', value: 'ruling-issued'},
          {title: 'Appealed', value: 'appealed'},
          {title: 'Closed', value: 'closed'},
        ],
      },
    }),
    defineField({
      name: 'filedAt',
      title: 'Filed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'ruling',
      title: 'Ruling',
      type: 'reference',
      to: [{type: 'ruling'}],
      description: 'Set automatically once the Commissioner reviews the case',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'caseNumber',
      status: 'status',
    },
    prepare({title, subtitle, status}) {
      return {
        title,
        subtitle: `${subtitle || 'unfiled'} · ${status}`,
      }
    },
  },
})
