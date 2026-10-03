import {defineField, defineType} from 'sanity'

export const commissioner = defineType({
  name: 'commissioner',
  title: 'Commissioner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'honorific',
      title: 'Honorific',
      type: 'string',
      description: 'e.g. "Chief Arbiter of Domestic Justice"',
    }),
    defineField({
      name: 'personality',
      title: 'Personality Brief',
      type: 'text',
      rows: 6,
      description: 'System prompt describing tone and disposition when ruling on cases',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
    }),
    defineField({
      name: 'active',
      title: 'Currently Presiding',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
